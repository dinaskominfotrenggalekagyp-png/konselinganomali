import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { isSuperadminRole } from "@/lib/roles";

export const runtime = "nodejs";

const MAX_SIZE = 4 * 1024 * 1024; // di bawah batas body Vercel (±4,5 MB)

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

/**
 * Supabase Storage dipakai supaya upload tetap berfungsi di Vercel, karena
 * filesystem serverless bersifat read-only & ephemeral.
 */
function supabaseStorage() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key, bucket: BUCKET };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isSuperadminRole(session.role)) {
    return NextResponse.json({ error: "Akses khusus Super Admin" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar tidak ditemukan" }, { status: 400 });
    }

    const extension = EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Format harus JPG, PNG, WebP, atau GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran gambar maksimal 4 MB. Kompres dulu fotonya." },
        { status: 400 }
      );
    }

    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // --- Supabase Storage (produksi / Vercel) ---
    const storage = supabaseStorage();
    if (storage) {
      const response = await fetch(
        `${storage.url}/storage/v1/object/${storage.bucket}/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storage.key}`,
            "Content-Type": file.type,
            "x-upsert": "false",
            "cache-control": "public, max-age=31536000, immutable",
          },
          body: buffer,
        }
      );

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.error("supabase storage error", response.status, detail);
        return NextResponse.json(
          {
            error: `Gagal mengunggah gambar ke storage (${response.status}). ${detail
              .replace(/\s+/g, " ")
              .slice(0, 180)}`,
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        url: `${storage.url}/storage/v1/object/public/${storage.bucket}/${filename}`,
      });
    }

    // --- Tanpa storage di produksi: jangan diam-diam menulis ke disk ---
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Storage belum dikonfigurasi. Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di environment.",
        },
        { status: 500 }
      );
    }

    // --- Fallback lokal (development) ---
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("upload error", error);
    return NextResponse.json({ error: "Gagal mengunggah gambar" }, { status: 500 });
  }
}
