import { getSession } from "@/lib/auth";
import { isAdminRole, isStaffRole } from "@/lib/roles";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 5000;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const canViewMessages = isAdminRole(session.role);
  const encoder = new TextEncoder();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      const counts = async () => {
        const [bookings, messages] = await Promise.all([
          db.booking.count({ where: { status: "PENDING" } }),
          canViewMessages
            ? db.contactMessage.count({ where: { status: "NEW" } })
            : Promise.resolve(0),
        ]);
        return { bookings, messages };
      };

      send("ready", {
        counts: await counts(),
        at: new Date().toISOString(),
        pollMs: POLL_MS,
      });

      let lastCheck = new Date();

      const tick = async () => {
        if (closed) return;
        const since = lastCheck;
        lastCheck = new Date();

        try {
          const [bookings, messages] = await Promise.all([
            db.booking.findMany({
              where: { createdAt: { gt: since } },
              include: { service: true },
              orderBy: { createdAt: "asc" },
              take: 10,
            }),
            canViewMessages
              ? db.contactMessage.findMany({
                  where: { createdAt: { gt: since } },
                  orderBy: { createdAt: "asc" },
                  take: 10,
                })
              : Promise.resolve(
                  [] as Awaited<ReturnType<typeof db.contactMessage.findMany>>
                ),
          ]);

          if (bookings.length === 0 && messages.length === 0) {
            send("ping", {
              at: new Date().toISOString(),
              counts: await counts(),
            });
            return;
          }

          send("update", {
            at: new Date().toISOString(),
            counts: await counts(),
            bookings: bookings.map((booking) => ({
              id: booking.id,
              code: booking.code,
              name: booking.guestName,
              phone: booking.guestPhone,
              service: booking.service.name,
              date: booking.date,
              time: booking.time,
              createdAt: booking.createdAt.toISOString(),
            })),
            messages: canViewMessages
              ? messages.map((message) => ({
                  id: message.id,
                  name: message.name,
                  email: message.email,
                  phone: message.phone,
                  service: message.service,
                  excerpt:
                    message.message.length > 160
                      ? `${message.message.slice(0, 160).trimEnd()}…`
                      : message.message,
                  createdAt: message.createdAt.toISOString(),
                }))
              : [],
          });
        } catch (error) {
          send("notice", {
            level: "error",
            message:
              error instanceof Error ? error.message : "Gagal memuat pembaruan",
          });
        }
      };

      timer = setInterval(tick, POLL_MS);

      request.signal.addEventListener("abort", () => {
        if (closed) return;
        closed = true;
        if (timer) clearInterval(timer);
        try {
          controller.close();
        } catch {
          // stream sudah tertutup
        }
      });
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
