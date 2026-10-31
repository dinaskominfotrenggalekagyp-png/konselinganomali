import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { isSuperadminRole } from "@/lib/roles";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
      return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    await writeFile(
      path.join(uploadDir, filename),
      Buffer.from(await file.arrayBuffer())
    );

    return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("upload error", error);
    return NextResponse.json({ error: "Gagal mengunggah gambar" }, { status: 500 });
  }
}
