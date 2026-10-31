import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { AssessmentBuilder } from "@/components/assessment-builder";

export const dynamic = "force-dynamic";

export default async function AdminAsesmenBaruPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireSuperadmin();
  const { error } = await searchParams;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/asesmen"
          className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted transition hover:text-brand-dark"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke asesmen
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-brand-deep">
          Buat soal asesmen psikotes
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Susun pertanyaan, pilihan jawaban, dan kategori hasil. Asesmen akan tampil
          di halaman psikotes publik setelah disimpan sebagai aktif.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <AssessmentBuilder />
    </div>
  );
}
