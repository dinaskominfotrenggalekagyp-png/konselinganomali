import {
  CalendarCheck,
  HeartPulse,
  LineChart,
  Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, MOOD_LABEL, moodEmoji, todayISO } from "@/lib/utils";
import { MoodCheckin } from "@/components/mood-checkin";

export const dynamic = "force-dynamic";

export default async function PortalMoodPage() {
  const user = await requireUser();
  const entries = await db.moodEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  const today = todayISO();
  const todayEntry = entries.find((e) => e.date === today);

  const avg =
    entries.length > 0
      ? entries.reduce((acc, e) => acc + e.mood, 0) / entries.length
      : 0;

  // streak: hari berturut-turut dengan check-in, dihitung mundur dari hari ini
  let streak = 0;
  const dateSet = new Set(entries.map((e) => e.date));
  const cursor = new Date(`${today}T00:00:00`);
  if (!dateSet.has(today)) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 60; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const chart = [...entries].reverse();
  const maxMood = 5;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Mood Tracker
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[32px]">
          Bagaimana perasaan Anda?
        </h1>
        <p className="mt-1 text-[12.5px] text-muted">
          Check-in singkat setiap hari membantu Anda melihat pola emosi dari waktu ke waktu.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Rata-rata mood", value: avg ? avg.toFixed(1) : "—", sub: `${entries.length} check-in` },
          { label: "Streak", value: `${streak}`, sub: "hari berturut-turut" },
          { label: "Hari ini", value: todayEntry ? moodEmoji(todayEntry.mood) : "—", sub: todayEntry ? MOOD_LABEL[todayEntry.mood - 1] : "belum check-in" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[9.5px] text-muted">{s.label}</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">
              {s.value}
            </p>
            <p className="text-[9px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Tren 30 hari
            </h2>
            <LineChart className="h-4 w-4 text-brand/50" />
          </div>

          {chart.length === 0 ? (
            <div className="mt-4 flex h-[200px] items-center justify-center rounded-2xl bg-surface text-[11px] text-muted">
              Grafik akan muncul setelah check-in pertama.
            </div>
          ) : (
            <div className="mt-5">
              <div className="relative h-[200px]">
                {[5, 4, 3, 2, 1].map((line) => (
                  <div
                    key={line}
                    className="absolute inset-x-0 border-t border-dashed border-line/60"
                    style={{ top: `${((maxMood - line) / maxMood) * 100}%` }}
                  />
                ))}
                <div className="relative z-10 flex h-full items-end gap-[3px]">
                  {chart.map((entry) => (
                    <div key={entry.id} className="group relative flex-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-brand/50 to-brand transition group-hover:from-brand-dark group-hover:to-brand-accent"
                        style={{ height: `${(entry.mood / maxMood) * 100}%` }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-deep px-2 py-1 text-[8px] text-white group-hover:block">
                        {entry.date.slice(5)} · {MOOD_LABEL[entry.mood - 1]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-muted">
                <span>{chart[0]?.date.slice(5)}</span>
                <span>{chart[chart.length - 1]?.date.slice(5)}</span>
              </div>
            </div>
          )}

          {entries.length > 0 && (
            <div className="mt-5 rounded-2xl bg-brand-mint/50 p-4">
              <div className="flex items-center gap-2 text-brand">
                <Sparkles className="h-4 w-4" />
                <p className="text-[11px] font-semibold text-brand-deep">Insight singkat</p>
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                {avg >= 4
                  ? "Mood Anda cenderung positif dalam periode ini. Pertahankan rutinitas yang membantu—tidur cukup, gerak tubuh, dan koneksi sosial."
                  : avg >= 3
                    ? "Mood Anda relatif stabil dengan beberapa fluktuasi. Perhatikan pemicu di hari-hari rendah dan beri ruang untuk pemulihan."
                    : "Ada cukup banyak hari berat belakangan ini. Ini bukan kelemahan—pertimbangkan berbicara dengan psikolog untuk dukungan yang lebih terarah."}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Check-in hari ini
              </h2>
              <HeartPulse className="h-4 w-4 text-brand/50" />
            </div>
            <p className="mt-0.5 text-[10px] text-muted">
              {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div className="mt-3">
              <MoodCheckin
                current={todayEntry ? { mood: todayEntry.mood, note: todayEntry.note } : null}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-brand-deep p-5 text-white">
            <CalendarCheck className="h-5 w-5 text-brand-accent" />
            <h2 className="mt-2 font-serif text-lg font-semibold leading-snug">
              Mood adalah data, bukan penilaian
            </h2>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-white/60">
              Tujuannya bukan selalu bahagia, melainkan mengenali pola dan merespons
              dengan tepat. Bawa catatan ini ke sesi konseling Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h2 className="font-serif text-lg font-semibold text-brand-deep">
          Riwayat check-in
        </h2>
        {entries.length === 0 ? (
          <p className="mt-3 rounded-xl bg-surface px-4 py-6 text-center text-[11px] text-muted">
            Belum ada catatan.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-line">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-3">
                <span className="text-xl">{moodEmoji(entry.mood)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-medium text-ink">
                    {MOOD_LABEL[entry.mood - 1]}
                    <span className="ml-2 text-[9.5px] font-normal text-muted">
                      {formatDate(entry.date)}
                    </span>
                  </p>
                  {entry.note && (
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
