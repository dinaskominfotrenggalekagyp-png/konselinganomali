import { Check, Mail, MessageCircle, Reply } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, STATUS_LABEL, STATUS_TONE } from "@/lib/utils";
import { setMessageStatusAction } from "@/app/admin/actions";
import { whatsappLink } from "@/lib/utils";
import { DeleteMessageButton } from "@/components/delete-message-button";

export const dynamic = "force-dynamic";

export default async function AdminPesanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { status = "ALL", ok, error } = await searchParams;

  const messages = await db.contactMessage.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    ALL: await db.contactMessage.count(),
    NEW: await db.contactMessage.count({ where: { status: "NEW" } }),
    READ: await db.contactMessage.count({ where: { status: "READ" } }),
    REPLIED: await db.contactMessage.count({ where: { status: "REPLIED" } }),
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Komunikasi
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
          Pesan masuk
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          {counts.NEW} pesan baru menunggu respons.
        </p>
      </div>

      {ok && (
        <p className="rounded-xl bg-brand-mint px-4 py-3 text-[11px] font-medium text-brand-dark">
          ✓ {ok}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(["ALL", "NEW", "READ", "REPLIED"] as const).map((key) => (
          <a
            key={key}
            href={`/admin/pesan?status=${key}`}
            className={`rounded-full px-3 py-1.5 text-[10.5px] font-medium transition ${
              status === key
                ? "bg-brand-dark text-white"
                : "bg-white text-ink/60 ring-1 ring-line hover:text-brand-dark"
            }`}
          >
            {key === "ALL" ? "Semua" : STATUS_LABEL[key]}{" "}
            <span className="opacity-60">({counts[key]})</span>
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-mint text-[12px] font-bold text-brand-dark">
                  {message.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12.5px] font-semibold text-ink">{message.name}</p>
                    <span className={`chip ring-1 ${STATUS_TONE[message.status]}`}>
                      {STATUS_LABEL[message.status]}
                    </span>
                    {message.service && (
                      <span className="chip bg-surface text-muted">{message.service}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {message.email}
                    {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent("Balasan dari Konseling Trenggalek")}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[9.5px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
                >
                  <Reply className="h-3 w-3" /> Email
                </a>
                {message.phone && (
                  <a
                    href={whatsappLink(
                      message.phone,
                      `Halo ${message.name}, terima kasih telah menghubungi Konseling Trenggalek.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[9.5px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
                  >
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            <p className="mt-3 rounded-xl bg-surface/70 p-3.5 text-[11.5px] leading-relaxed text-ink/75">
              {message.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              {message.status !== "READ" && (
                <form action={setMessageStatusAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value="READ" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1.5 text-[9.5px] font-medium text-ink/70 transition hover:text-brand"
                  >
                    <Check className="h-3 w-3" /> Tandai dibaca
                  </button>
                </form>
              )}
              {message.status !== "REPLIED" && (
                <form action={setMessageStatusAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value="REPLIED" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-mint px-2.5 py-1.5 text-[9.5px] font-medium text-brand-dark transition hover:bg-brand hover:text-white"
                  >
                    <Mail className="h-3 w-3" /> Tandai dibalas
                  </button>
                </form>
              )}
              {message.status !== "NEW" && (
                <form action={setMessageStatusAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value="NEW" />
                  <button
                    type="submit"
                    className="text-[9.5px] text-muted underline-offset-2 hover:underline"
                  >
                    Tandai baru
                  </button>
                </form>
              )}
              <span className="ml-auto">
                <DeleteMessageButton
                  id={message.id}
                  disabled={message.status !== "REPLIED"}
                />
              </span>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[11.5px] text-muted">
            Tidak ada pesan pada filter ini.
          </div>
        )}
      </div>
    </div>
  );
}
