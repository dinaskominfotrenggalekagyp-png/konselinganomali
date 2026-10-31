/**
 * Migrasi data dari SQLite lama (prisma/dev.db) ke MySQL/MariaDB (XAMPP).
 *
 * Pemakaian:
 *   1. Pastikan MySQL XAMPP berjalan dan DATABASE_URL di .env menunjuk ke MySQL.
 *   2. npx prisma db push        (buat tabel di MySQL)
 *   3. node prisma/migrate-sqlite-to-mysql.mjs [path-ke-dev.db]
 *
 * Skrip membaca semua tabel dari file SQLite (read-only, tanpa dependency
 * tambahan) lalu menulisnya ke MySQL lewat Prisma Client. Data di tabel
 * tujuan akan dikosongkan lebih dulu supaya skrip aman dijalankan berulang.
 */

import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient, Prisma } from "@prisma/client";

const sqlitePath = path.resolve(
  process.argv[2] ?? path.join(process.cwd(), "prisma", "dev.db")
);

if (!existsSync(sqlitePath)) {
  console.error(`✗ File SQLite tidak ditemukan: ${sqlitePath}`);
  process.exit(1);
}

const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
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

/** Urutkan model agar tabel induk dibuat lebih dulu (FK-safe). */
function sortByDependency() {
  const visited = new Map();
  const ordered = [];

  const visit = (model) => {
    const state = visited.get(model.name);
    if (state === "done" || state === "visiting") return;
    visited.set(model.name, "visiting");

    for (const field of model.fields) {
      if (field.kind !== "object") continue;
      // Hanya relasi pemilik FK (bukan back-relation virtual) yang menentukan urutan.
      if (!field.relationFromFields?.length) continue;
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
      if (typeof value === "number") return new Date(value);
      if (typeof value === "bigint") return new Date(Number(value));
      const parsed = new Date(String(value));
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Tanggal tidak valid pada ${field.name}: ${value}`);
      }
      return parsed;
    }
    case "Boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "number" || typeof value === "bigint") return Number(value) !== 0;
      return value === "1" || value === "true";
    case "Int":
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
      return value;
  }
}

async function main() {
  const ordered = sortByDependency();
  const summary = [];
  let totalRows = 0;

  // Kosongkan tabel tujuan (urutan terbalik agar aman terhadap FK).
  for (const model of [...ordered].reverse()) {
    await delegateOf(model).deleteMany();
  }

  for (const model of ordered) {
    const table = tableOf(model);
    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
    const scalarFields = model.fields.filter((field) => field.kind === "scalar");

    for (const row of rows) {
      const data = {};
      for (const field of scalarFields) {
        if (!(field.name in row)) continue;
        data[field.name] = coerceValue(field, row[field.name]);
      }
      await delegateOf(model).create({ data });
    }

    summary.push({ table, rows: rows.length });
    totalRows += rows.length;
  }

  const width = Math.max(...summary.map((entry) => entry.table.length), 5);
  console.log("\nMigrasi SQLite → MySQL selesai:\n");
  for (const entry of summary) {
    console.log(`  ${entry.table.padEnd(width)}  ${String(entry.rows).padStart(4)} baris`);
  }
  console.log(`  ${"TOTAL".padEnd(width)}  ${String(totalRows).padStart(4)} baris`);

  // Verifikasi: bandingkan jumlah baris di MySQL.
  console.log("\nVerifikasi jumlah baris di MySQL:");
  let mismatch = 0;
  for (const entry of summary) {
    const model = byName.get(entry.table) ?? models.find((m) => tableOf(m) === entry.table);
    const count = await delegateOf(model).count();
    const ok = count === entry.rows;
    if (!ok) mismatch += 1;
    console.log(`  ${entry.table.padEnd(width)}  sqlite=${String(entry.rows).padStart(4)}  mysql=${String(count).padStart(4)}  ${ok ? "OK" : "BEDA"}`);
  }

  if (mismatch > 0) {
    console.error(`\n✗ ${mismatch} tabel tidak cocok jumlah barisnya.`);
    process.exitCode = 1;
  } else {
    console.log("\n✓ Semua tabel cocok.");
  }
}

main()
  .catch((error) => {
    console.error("\n✗ Migrasi gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
