/**
 * Persiapan gambar di sisi klien sebelum diunggah.
 *
 * Dua masalah nyata yang diselesaikan di sini:
 *
 * 1. Vercel membatasi body request function ±4,5 MB. Foto dari kamera ponsel
 *    sering 3–8 MB sehingga upload gagal sebelum sampai ke aplikasi.
 * 2. Supabase Storage menyimpan file apa adanya; gambar 12 MP tidak perlu
 *    disimpan penuh untuk cover/logo.
 *
 * Gambar diperkecil ke maksimal 1920 px (sisi terpanjang) dan dikonversi ke
 * JPEG kualitas 0.85 bila terlalu besar. GIF dibiarkan apa adanya agar
 * animasinya tidak hilang.
 */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // batas aman di bawah 4,5 MB Vercel
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

export async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_DIMENSION / longestSide);

    if (scale === 1 && file.size <= MAX_UPLOAD_BYTES) {
      bitmap.close?.();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close?.();
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );

    if (!blob || blob.size === 0) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "gambar";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    // Kalau browser tidak mendukung canvas/createImageBitmap, unggah aslinya.
    return file;
  }
}
