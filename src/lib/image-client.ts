/**
 * Penyiapan gambar di sisi klien sebelum diunggah.
 *
 * Tujuan:
 *  - Menekan ukuran file ke sekitar 100 KB agar unggahan cepat dan hemat
 *    storage/kuota (foto kamera ponsel bisa 3–8 MB).
 *  - Menghindari batas body request Vercel (±4,5 MB) yang membuat upload gagal
 *    sebelum sampai ke aplikasi.
 *
 * Gambar diperkecil bertahap (1600 px → 640 px) dan kualitasnya diturunkan
 * sampai di bawah target. Format WebP dipakai karena mendukung transparansi
 * (penting untuk logo) sekaligus jauh lebih kecil dari PNG/JPEG.
 *
 * GIF tidak diubah agar animasinya tetap hidup.
 */
const TARGET_BYTES = 100 * 1024;
const DIMENSIONS = [1600, 1280, 1024, 800, 640];
const QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42];
const HARD_LIMIT = 4 * 1024 * 1024;

let webpSupported: boolean | null = null;

function supportsWebp() {
  if (webpSupported !== null) return webpSupported;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupported = false;
  }
  return webpSupported;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);

    // Sudah kecil dan tidak perlu diperkecil: kirim apa adanya.
    if (file.size <= TARGET_BYTES && longestSide <= DIMENSIONS[0]) {
      bitmap.close?.();
      return file;
    }

    const mime = supportsWebp()
      ? "image/webp"
      : file.type === "image/png"
        ? "image/png"
        : "image/jpeg";
    const extension = mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : "jpg";

    let smallest: Blob | null = null;

    for (const maxDimension of DIMENSIONS) {
      const scale = Math.min(1, maxDimension / longestSide);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));

      const context = canvas.getContext("2d");
      if (!context) break;
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const blob = await toBlob(canvas, mime, quality);
        if (!blob || blob.size === 0) continue;
        if (!smallest || blob.size < smallest.size) smallest = blob;
        if (blob.size <= TARGET_BYTES) {
          bitmap.close?.();
          return new File([blob], renameFile(file.name, extension), { type: mime });
        }
      }
    }

    bitmap.close?.();

    if (!smallest) return file;

    if (smallest.size > HARD_LIMIT) {
      throw new Error("Gambar terlalu besar. Coba gambar lain atau perkecil dulu.");
    }

    return new File([smallest], renameFile(file.name, extension), { type: mime });
  } catch (error) {
    if (error instanceof Error && error.message.includes("terlalu besar")) throw error;
    // Browser tanpa dukungan canvas/createImageBitmap: unggah aslinya.
    return file;
  }
}

function renameFile(name: string, extension: string) {
  const baseName = name.replace(/\.[^.]+$/, "") || "gambar";
  return `${baseName}.${extension}`;
}

/** Ukuran file dalam KB untuk ditampilkan di UI. */
export function fileSizeKb(file: File) {
  return Math.max(1, Math.round(file.size / 1024));
}
