/**
 * Migrasi data dari MySQL/MariaDB (XAMPP) ke PostgreSQL (Supabase).
 *
 * Pemakaian:
 *   1. DATABASE_URL & DIRECT_URL di .env sudah menunjuk ke Supabase (PostgreSQL).
 *   2. Skema PostgreSQL sudah dibuat:
 *        npx prisma db push        (cepat, tanpa migration history)
 *        -- atau --
 *        npx prisma migrate deploy (kalau folder prisma/migrations ada)
 *   3. MYSQL_SOURCE_URL di .env menunjuk ke database MySQL sumber.
 *   4. node prisma/migrate-mysql-to-supabase.mjs
 *
 * Skrip hanya MEMBACA dari MySQL (read-only) dan menulis ke PostgreSQL lewat
 * Prisma Client. Tabel tujuan dikosongkan lebih dulu supaya aman dijalankan
 * berulang. Di akhir, jumlah baris per tabel dibandingkan.
 *
 * Opsi:
 *   --dry-run   hanya membaca MySQL + menampilkan ringkasan, tidak menulis
 *   --no-reset  jangan kosongkan tabel tujuan (hanya tambah data)
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import { PrismaClient, Prisma } from "@prisma/client";

const SOURCE_URL =
  process.env.MYSQL_SOURCE_URL ?? "mysql://root:@127.0.0.1:3306/koseling_tgx";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const RESET = !args.has("--no-reset");

const prisma = new PrismaClient();

const models = Prisma.dmmf.datamodel.models;
if (!models?.length) {
  console.error("✗ DMMF Prisma tidak tersedia. Jalankan `npx prisma generate` dulu.");
  process.exit(1);
}

const byName = new Map(models.map((model) => [model.name, model]));
const tableOf = (model) => model.dbName ?? model.name;
const delegateOf = (model) => {
  const key = model.name.charAt(0).toLowerCase() + model.name.slice(1);
  const delegate = prisma[key];
  if (!delegate) throw new Error(`Delegate Prisma tidak ditemukan: ${model.name}`);
  return delegate;
};

/** Urutkan model agar tabel induk ditulis lebih dulu (FK-safe). */
function sortByDependency() {
  const visited = new Map();
  const ordered = [];

  const visit = (model) => {
    const state = visited.get(model.name);
    if (state === "done" || state === "visiting") return;
    visited.set(model.name, "visiting");

    for (const field of model.fields) {
      if (field.kind !== "object") continue;
      if (!field.relationFromFields?.length) continue; // back-relation virtual
      const target = byName.get(field.type);
      if (target && target.name !== model.name) visit(target);
    }

    visited.set(model.name, "done");
    ordered.push(model);
  };

  models.forEach(visit);
  return ordered;
}

function coerceValue(field, value) {
  if (value === null || value === undefined) return null;

  switch (field.type) {
    case "DateTime": {
      if (value instanceof Date) return value;
      const parsed = new Date(typeof value === "string" ? value : Number(value));
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Tanggal tidak valid pada ${field.name}: ${value}`);
      }
      return parsed;
    }
    case "Boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "bigint") return value !== 0n;
      return Number(value) !== 0;
    case "Int":
      return typeof value === "bigint" ? Number(value) : Number.parseInt(String(value), 10);
    case "Float":
      return typeof value === "bigint" ? Number(value) : Number(value);
    case "BigInt":
      return typeof value === "bigint" ? value : BigInt(value);
    case "Decimal":
      return String(value);
    case "Bytes":
      return value instanceof Uint8Array ? Buffer.from(value) : Buffer.from(String(value));
    default:
      if (typeof value === "bigint") return value.toString();
      if (value instanceof Uint8Array) return Buffer.from(value).toString("utf8");
      if (value instanceof Date) return value.toISOString();
      return value;
  }
}

function parseUrl(raw) {
  const url = new URL(raw);
  if (!["mysql:", "mariadb:"].includes(url.protocol)) {
    throw new Error(`MYSQL_SOURCE_URL harus mysql://..., dapat: ${url.protocol}`);
  }
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  };
}

async function main() {
  const config = parseUrl(SOURCE_URL);
  const connection = await mysql.createConnection({
    ...config,
    charset: "utf8mb4",
    dateStrings: false,
    supportBigNumbers: true,
    bigNumberStrings: false,
  });

  console.log(`→ Sumber MySQL : ${config.user}@${config.host}:${config.port}/${config.database}`);
  console.log(`→ Tujuan Prisma: ${(process.env.DATABASE_URL ?? "").replace(/:\/\/[^@]*@/, "://***@")}`);
  if (DRY_RUN) console.log("→ Mode dry-run: tidak ada data yang ditulis.\n");

  // Nama tabel aktual di MySQL (Windows: lower_case_table_names=1 → huruf kecil).
  const [tableRows] = await connection.query(
    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?",
    [config.database]
  );
  const actualTables = new Map(
    tableRows.map((row) => [String(row.name).toLowerCase(), String(row.name)])
  );

  const ordered = sortByDependency();
  const summary = [];
  let totalRows = 0;

  if (!DRY_RUN && RESET) {
    for (const model of [...ordered].reverse()) {
      await delegateOf(model).deleteMany();
    }
    console.log("→ Tabel tujuan dikosongkan.\n");
  }

  for (const model of ordered) {
    const logicalTable = tableOf(model);
    const sourceTable = actualTables.get(logicalTable.toLowerCase());

    if (!sourceTable) {
      console.log(`  ⚠ ${logicalTable}: tabel tidak ada di MySQL, dilewati.`);
      summary.push({ table: logicalTable, rows: 0, written: 0 });
      continue;
    }

    const [rows] = await connection.query(
      `SELECT * FROM \`${sourceTable}\``
    );

    const scalarFields = model.fields.filter((field) => field.kind === "scalar");
    const data = rows.map((row) => {
      const entry = {};
      for (const field of scalarFields) {
        if (!(field.name in row)) continue;
        entry[field.name] = coerceValue(field, row[field.name]);
      }
      return entry;
    });

    let written = 0;
    if (!DRY_RUN && data.length > 0) {
      const result = await delegateOf(model).createMany({
        data,
        skipDuplicates: true,
      });
      written = result.count;
    }

    summary.push({ table: logicalTable, rows: rows.length, written });
    totalRows += rows.length;
  }

  await connection.end();

  const width = Math.max(...summary.map((entry) => entry.table.length), 5);
  console.log(`\nMigrasi MySQL → Supabase${DRY_RUN ? " (dry-run)" : ""}:\n`);
  for (const entry of summary) {
    const extra = DRY_RUN ? "" : `  ditulis=${String(entry.written).padStart(4)}`;
    console.log(`  ${entry.table.padEnd(width)}  sumber=${String(entry.rows).padStart(4)}${extra}`);
  }
  console.log(`  ${"TOTAL".padEnd(width)}  sumber=${String(totalRows).padStart(4)}`);

  if (DRY_RUN) return;

  // Verifikasi: bandingkan jumlah baris di PostgreSQL.
  console.log("\nVerifikasi jumlah baris di Supabase:");
  let mismatch = 0;
  for (const entry of summary) {
    const model = models.find((m) => tableOf(m) === entry.table);
    const count = await delegateOf(model).count();
    const ok = count === entry.rows;
    if (!ok) mismatch += 1;
    console.log(
      `  ${entry.table.padEnd(width)}  mysql=${String(entry.rows).padStart(4)}  supabase=${String(count).padStart(4)}  ${ok ? "OK" : "BEDA"}`
    );
  }

  if (mismatch > 0) {
    console.error(`\n✗ ${mismatch} tabel jumlah barisnya tidak cocok.`);
    process.exitCode = 1;
  } else {
    console.log("\n✓ Semua tabel cocok. Migrasi selesai.");
  }
}

main()
  .catch((error) => {
    console.error("\n✗ Migrasi gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
