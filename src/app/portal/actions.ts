"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function sendSessionMessageAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!bookingId || !body) {
    redirect("/portal/pesan?error=Pesan+tidak+boleh+kosong");
  }
  if (body.length > 2000) {
    redirect("/portal/pesan?error=Pesan+maksimal+2000+karakter");
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, userId: true },
  });

  if (!booking || booking.userId !== user.id) {
    redirect("/portal/pesan?error=Jadwal+tidak+ditemukan");
  }

  await db.sessionMessage.create({
    data: { bookingId, userId: user.id, body },
  });

  revalidatePath("/portal/pesan");
  revalidatePath("/admin/pesan-sesi");
  redirect("/portal/pesan?ok=Pesan+terkirim");
}
