import "server-only";

/**
 * Helper Supabase Storage untuk sisi server.
 *
 * Dipakai oleh route upload (menyimpan file) dan server action (menghapus file
 * lama saat gambar diganti) supaya URL/bucket tidak ditulis berulang.
 */
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

export function storageConfig() {
  const rawUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) return null;
  return { url: rawUrl.replace(/\/+$/, ""), key, bucket: STORAGE_BUCKET };
}

export function storagePublicUrl(filename: string) {
  const config = storageConfig();
  if (!config) return null;
  return `${config.url}/storage/v1/object/public/${config.bucket}/${filename}`;
}

/** True bila URL menunjuk ke bucket Storage milik aplikasi ini. */
export function isStoragePublicUrl(value: string | null | undefined) {
  if (!value) return false;
  const config = storageConfig();
  if (!config) return false;
  return value.startsWith(`${config.url}/storage/v1/object/public/${config.bucket}/`);
}

/**
 * Hapus objek lama dari Storage. Aman dipanggil untuk URL eksternal
 * (Unsplash, /uploads lokal, dsb.) — fungsi langsung mengembalikan false.
 */
export async function deleteStorageObject(value: string | null | undefined) {
  if (!isStoragePublicUrl(value)) return false;

  const config = storageConfig();
  if (!config || !value) return false;

  const prefix = `${config.url}/storage/v1/object/public/${config.bucket}/`;
  const objectPath = value.slice(prefix.length).split("?")[0];
  if (!objectPath) return false;

  try {
    const response = await fetch(
      `${config.url}/storage/v1/object/${config.bucket}/${objectPath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${config.key}`,
          apikey: config.key,
        },
      }
    );

    // 404 = sudah tidak ada, anggap berhasil.
    if (!response.ok && response.status !== 404) {
      const detail = await response.text().catch(() => "");
      console.error(
        "[storage] gagal menghapus objek",
        response.status,
        detail.replace(/\s+/g, " ").slice(0, 180)
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[storage] error saat menghapus objek:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}
