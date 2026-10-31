"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  hashPassword,
  requireAdmin,
  requireStaff,
  requireSuperadmin,
} from "@/lib/auth";
import { articleSchema } from "@/lib/validators";
import { logActivity, notifyAdmin } from "@/lib/integrations";
import { slugify } from "@/lib/utils";
import { isSuperadminRole, normalizeRole } from "@/lib/roles";
import {
  BRANDING_KEYS,
  DEFAULT_BRANDING,
  safeHex,
} from "@/lib/branding";

const accountSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SUPERADMIN", "ADMIN", "PSYCHOLOGIST", "CLIENT"]),
});

const updateAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  role: z.enum(["SUPERADMIN", "ADMIN", "PSYCHOLOGIST", "CLIENT"]),
});

export async function createAccountAction(formData: FormData) {
  const actor = await requireAdmin();

  const parsed = accountSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    role: normalizeRole(formData.get("role")),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Data akun belum lengkap";
    redirect(`/admin/akun?error=${encodeURIComponent(message)}`);
  }

  const { name, email, phone, password, role } = parsed.data;

  if (role === "PSYCHOLOGIST" && !isSuperadminRole(actor.role)) {
    redirect("/admin/akun?error=Akun+psikolog+hanya+bisa+dibuat+oleh+Super+Admin");
  }
  if (role !== "CLIENT" && !isSuperadminRole(actor.role)) {
    redirect("/admin/akun?error=Admin+hanya+dapat+membuat+akun+klien");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/akun?error=Email+sudah+terdaftar");
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await hashPassword(password),
      role,
    },
  });

  await logActivity(actor.id, "ACCOUNT_CREATED", `${user.email} · ${role}`);
  revalidatePath("/admin/akun");
  redirect(`/admin/akun?ok=${encodeURIComponent(`Akun ${user.email} dibuat`)}`);
}

export async function updateAccountAction(formData: FormData) {
  const actor = await requireSuperadmin();

  const parsed = updateAccountSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "CLIENT"),
  });

  if (!parsed.success) {
    const id = String(formData.get("id") ?? "");
    const message = parsed.error.issues[0]?.message ?? "Data akun belum lengkap";
    redirect(
      `${id ? `/admin/akun/${id}` : "/admin/akun"}?error=${encodeURIComponent(message)}`
    );
  }

  const { id, name, email, phone, password, role } = parsed.data;

  if (password && password.length < 6) {
    redirect(`/admin/akun/${id}?error=Password+minimal+6+karakter`);
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/admin/akun?error=Akun+tidak+ditemukan");
  }

  const emailTaken = await db.user.findFirst({
    where: { email, id: { not: id } },
    select: { id: true },
  });
  if (emailTaken) {
    redirect(`/admin/akun/${id}?error=Email+sudah+terdaftar`);
  }

  if (target.role === "SUPERADMIN" && role !== "SUPERADMIN") {
    const total = await db.user.count({ where: { role: "SUPERADMIN" } });
    if (total <= 1) {
      redirect("/admin/akun?error=Minimal+harus+ada+satu+Super+Admin");
    }
  }

  await db.user.update({
    where: { id },
    data: {
      name,
      email,
      phone: phone || null,
      role,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });

  if (id === actor.id) {
    await createSession({ sub: actor.id, name, email, role });
  }

  await logActivity(
    actor.id,
    "ACCOUNT_UPDATED",
    `${target.email} → ${email} · ${role}`
  );

  revalidatePath("/admin/akun");
  revalidatePath(`/admin/akun/${id}`);
  redirect(`/admin/akun?ok=${encodeURIComponent(`Akun ${email} diperbarui`)}`);
}

export async function deleteAccountAction(formData: FormData) {
  const actor = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  if (id === actor.id) {
    redirect("/admin/akun?error=Tidak+dapat+menghapus+akun+sendiri");
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/admin/akun?error=Akun+tidak+ditemukan");
  }

  if (target.role === "SUPERADMIN") {
    const total = await db.user.count({ where: { role: "SUPERADMIN" } });
    if (total <= 1) {
      redirect("/admin/akun?error=Minimal+harus+ada+satu+Super+Admin");
    }
  }

  await db.user.delete({ where: { id } });
  await logActivity(actor.id, "ACCOUNT_DELETED", `${target.email} · ${target.role}`);
  revalidatePath("/admin/akun");
  redirect(`/admin/akun?ok=${encodeURIComponent(`Akun ${target.email} dihapus`)}`);
}

export async function togglePsychologistAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const psychologist = await db.psychologist.findUnique({ where: { id } });
  if (!psychologist) return;

  await db.psychologist.update({
    where: { id },
    data: { isActive: !psychologist.isActive },
  });

  await logActivity(
    admin.id,
    "ADMIN_TOGGLE_PSYCHOLOGIST",
    `${psychologist.name} → ${!psychologist.isActive ? "aktif" : "nonaktif"}`
  );

  revalidatePath("/admin/psikolog");
  revalidatePath("/klinik");
  revalidatePath("/");
  revalidateTag("psychologists");
}

export async function createPsychologistAction(formData: FormData) {
  const admin = await requireSuperadmin();

  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const specialties = String(formData.get("specialties") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const education = String(formData.get("education") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const experience = Number(formData.get("experience") ?? 0);
  const photo = String(formData.get("photo") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !title || !specialties || !bio || !price) {
    redirect("/admin/psikolog?error=Data+belum+lengkap");
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect("/admin/psikolog?error=Email+akun+psikolog+tidak+valid");
  }
  if (password.length < 6) {
    redirect("/admin/psikolog?error=Password+minimal+6+karakter");
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    redirect("/admin/psikolog?error=Email+sudah+dipakai+akun+lain");
  }

  const baseSlug = slugify(name.replace(/,.*$/, ""));
  let slug = baseSlug;
  let counter = 1;
  while (await db.psychologist.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const passwordHash = await hashPassword(password);

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "PSYCHOLOGIST",
      },
    });

    await tx.psychologist.create({
      data: {
        userId: user.id,
        name,
        slug,
        title,
        specialties,
        bio,
        education: education || null,
        price,
        experience: experience || 1,
        photo:
          photo ||
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
      },
    });
  });

  await logActivity(admin.id, "ADMIN_CREATE_PSYCHOLOGIST", `${name} · ${email}`);
  revalidatePath("/admin/psikolog");
  revalidatePath("/admin/akun");
  revalidatePath("/klinik");
  revalidatePath(`/klinik/psikolog/${slug}`);
  revalidatePath("/");
  revalidateTag("psychologists");
  redirect(
    `/admin/psikolog?ok=${encodeURIComponent(
      `Psikolog dan akun login ${email} berhasil dibuat`
    )}`
  );
}

export async function updatePsychologistAction(formData: FormData) {
  const admin = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price") ?? 0);

  if (!id || !Number.isFinite(price) || price < 0) {
    redirect("/admin/psikolog?error=Harga+tidak+valid");
  }

  const psychologist = await db.psychologist.findUnique({ where: { id } });
  if (!psychologist) {
    redirect("/admin/psikolog?error=Psikolog+tidak+ditemukan");
  }

  await db.psychologist.update({ where: { id }, data: { price } });
  await logActivity(
    admin.id,
    "ADMIN_UPDATE_PSYCHOLOGIST_PRICE",
    `${psychologist.name}: ${psychologist.price} → ${price}`
  );

  revalidatePath("/admin/psikolog");
  revalidatePath("/klinik");
  revalidatePath(`/klinik/psikolog/${psychologist.slug}`);
  revalidatePath("/");
  revalidateTag("psychologists");
  redirect(
    `/admin/psikolog?ok=${encodeURIComponent(
      `Harga ${psychologist.name} diperbarui`
    )}`
  );
}

const DEFAULT_PSYCHOLOGIST_PHOTO =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop";

export async function updatePsychologistDetailsAction(formData: FormData) {
  const actor = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/psikolog?error=Psikolog+tidak+ditemukan");
  }

  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const specialties = String(formData.get("specialties") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const education = String(formData.get("education") ?? "").trim();
  const photo = String(formData.get("photo") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const experience = Number(formData.get("experience") ?? 0);
  const rating = Number(formData.get("rating") ?? 4.9);
  const isActive = formData.get("isActive") === "on";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errorBase = `/admin/psikolog/${id}`;

  if (!name || !title || !specialties || bio.length < 8) {
    redirect(`${errorBase}?error=${encodeURIComponent("Data psikolog belum lengkap")}`);
  }
  if (!Number.isFinite(price) || price < 0) {
    redirect(`${errorBase}?error=${encodeURIComponent("Harga tidak valid")}`);
  }
  if (!Number.isFinite(experience) || experience < 0 || experience > 80) {
    redirect(`${errorBase}?error=${encodeURIComponent("Pengalaman tidak valid")}`);
  }
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    redirect(`${errorBase}?error=${encodeURIComponent("Rating harus 0—5")}`);
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect(`${errorBase}?error=${encodeURIComponent("Email tidak valid")}`);
  }
  if (password && password.length < 6) {
    redirect(`${errorBase}?error=${encodeURIComponent("Password minimal 6 karakter")}`);
  }

  const psychologist = await db.psychologist.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!psychologist) {
    redirect("/admin/psikolog?error=Psikolog+tidak+ditemukan");
  }

  if (!psychologist.userId && email && !password) {
    redirect(
      `${errorBase}?error=${encodeURIComponent(
        "Isi password untuk membuat akun login psikolog"
      )}`
    );
  }

  if (email) {
    const emailTaken = await db.user.findFirst({
      where: {
        email,
        ...(psychologist.userId ? { id: { not: psychologist.userId } } : {}),
      },
      select: { id: true },
    });
    if (emailTaken) {
      redirect(`${errorBase}?error=${encodeURIComponent("Email sudah dipakai akun lain")}`);
    }
  }

  const passwordHash = password ? await hashPassword(password) : null;

  await db.$transaction(async (tx) => {
    let userId = psychologist.userId;

    if (userId) {
      await tx.user.update({
        where: { id: userId },
        data: {
          name,
          ...(email ? { email } : {}),
          phone: phone || null,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
    } else if (email && passwordHash) {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          role: "PSYCHOLOGIST",
        },
      });
      userId = user.id;
    }

    await tx.psychologist.update({
      where: { id },
      data: {
        userId,
        name,
        title,
        specialties,
        bio,
        education: education || null,
        photo: photo || DEFAULT_PSYCHOLOGIST_PHOTO,
        price,
        experience: Math.round(experience) || 1,
        rating,
        isActive,
      },
    });
  });

  await logActivity(
    actor.id,
    "ADMIN_UPDATE_PSYCHOLOGIST",
    `${name} · ${email || psychologist.user?.email || "tanpa akun"}`
  );

  revalidatePath("/admin/psikolog");
  revalidatePath(`/admin/psikolog/${id}`);
  revalidatePath("/admin/akun");
  revalidatePath("/klinik");
  revalidatePath(`/klinik/psikolog/${psychologist.slug}`);
  revalidatePath("/");
  revalidateTag("psychologists");
  redirect(
    `/admin/psikolog/${id}?ok=${encodeURIComponent("Data psikolog dan akun diperbarui")}`
  );
}

export async function deletePsychologistAction(formData: FormData) {
  const actor = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const psychologist = await db.psychologist.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!psychologist) {
    redirect("/admin/psikolog?error=Psikolog+tidak+ditemukan");
  }

  await db.$transaction(async (tx) => {
    // Booking lama tetap tersimpan, hanya dilepas dari psikolog ini.
    await tx.booking.updateMany({
      where: { psychologistId: id },
      data: { psychologistId: null },
    });

    await tx.psychologist.delete({ where: { id } });

    if (psychologist.userId) {
      await tx.booking.updateMany({
        where: { userId: psychologist.userId },
        data: { userId: null },
      });
      await tx.assessmentResult.updateMany({
        where: { userId: psychologist.userId },
        data: { userId: null },
      });
      await tx.moodEntry.deleteMany({ where: { userId: psychologist.userId } });
      await tx.sessionMessage.deleteMany({
        where: { userId: psychologist.userId },
      });
      await tx.activityLog.updateMany({
        where: { userId: psychologist.userId },
        data: { userId: null },
      });
      await tx.user.delete({ where: { id: psychologist.userId } });
    }
  });

  await logActivity(
    actor.id,
    "ADMIN_DELETE_PSYCHOLOGIST",
    `${psychologist.name} · ${psychologist.user?.email ?? "tanpa akun"}`
  );

  revalidatePath("/admin/psikolog");
  revalidatePath("/admin/akun");
  revalidatePath("/klinik");
  revalidatePath(`/klinik/psikolog/${psychologist.slug}`);
  revalidatePath("/");
  revalidateTag("psychologists");
  redirect(
    `/admin/psikolog?ok=${encodeURIComponent(
      `Psikolog ${psychologist.name} dan akunnya dihapus`
    )}`
  );
}

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "READ");
  if (!id || !["NEW", "READ", "REPLIED"].includes(status)) return;

  await db.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pesan");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const message = await db.contactMessage.findUnique({ where: { id } });
  if (!message) {
    redirect("/admin/pesan?error=Pesan+tidak+ditemukan");
  }
  if (message.status !== "REPLIED") {
    redirect(
      "/admin/pesan?error=Pesan+harus+ditandai+dibalas+sebelum+dihapus"
    );
  }

  await db.contactMessage.delete({ where: { id } });
  await logActivity(
    actor.id,
    "CONTACT_MESSAGE_DELETED",
    `${message.name} · ${message.email}`
  );

  revalidatePath("/admin/pesan");
  revalidatePath("/admin");
  redirect("/admin/pesan?ok=Pesan+dihapus");
}

export async function replySessionMessageAction(formData: FormData) {
  const actor = await requireStaff();
  const bookingId = String(formData.get("bookingId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!bookingId || !body) return;
  if (body.length > 2000) {
    redirect("/admin/pesan-sesi?error=Pesan+maksimal+2000+karakter");
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, psychologistId: true, code: true },
  });
  if (!booking) {
    redirect("/admin/pesan-sesi?error=Booking+tidak+ditemukan");
  }

  if (actor.role === "PSYCHOLOGIST") {
    const psychologist = await db.psychologist.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!psychologist || booking.psychologistId !== psychologist.id) {
      redirect("/admin/pesan-sesi?error=Akses+ditolak");
    }
  }

  await db.sessionMessage.create({
    data: { bookingId, userId: actor.id, body },
  });

  await logActivity(actor.id, "SESSION_MESSAGE_REPLIED", booking.code);
  revalidatePath("/admin/pesan-sesi");
  revalidatePath("/portal/pesan");
  redirect("/admin/pesan-sesi?ok=Balasan+terkirim");
}

export async function saveArticleAction(formData: FormData) {
  const admin = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");

  const raw = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || slugify(String(formData.get("title") ?? "")),
    category: String(formData.get("category") ?? "Mental Health"),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    cover: String(formData.get("cover") ?? ""),
    author: String(formData.get("author") ?? ""),
    readMinutes: Number(formData.get("readMinutes") ?? 4),
    published: formData.get("published") === "on",
  };

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Data artikel tidak valid";
    redirect(
      `${id ? `/admin/artikel/${id}` : "/admin/artikel/baru"}?error=${encodeURIComponent(message)}`
    );
  }

  const data = parsed.data;
  const cover =
    data.cover ||
    "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1400&auto=format&fit=crop";

  const slugTaken = await db.article.findFirst({
    where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (slugTaken) {
    const message = "Slug sudah dipakai artikel lain";
    redirect(
      `${id ? `/admin/artikel/${id}` : "/admin/artikel/baru"}?error=${encodeURIComponent(message)}`
    );
  }

  if (id) {
    await db.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        excerpt: data.excerpt,
        content: data.content,
        cover,
        author: data.author,
        readMinutes: data.readMinutes,
        published: data.published,
      },
    });
    await logActivity(admin.id, "ADMIN_UPDATE_ARTICLE", data.title);
  } else {
    await db.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        excerpt: data.excerpt,
        content: data.content,
        cover,
        author: data.author,
        readMinutes: data.readMinutes,
        published: data.published,
      },
    });
    await logActivity(admin.id, "ADMIN_CREATE_ARTICLE", data.title);
  }

  revalidatePath("/admin/artikel");
  revalidatePath("/edukasi");
  revalidatePath("/");
  revalidateTag("articles");
  redirect("/admin/artikel?ok=Artikel+disimpan");
}

export async function deleteArticleAction(formData: FormData) {
  const admin = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const article = await db.article.delete({ where: { id } }).catch(() => null);
  if (article) {
    await logActivity(admin.id, "ADMIN_DELETE_ARTICLE", article.title);
  }

  revalidatePath("/admin/artikel");
  revalidatePath("/edukasi");
  revalidateTag("articles");
}

const assessmentOptionSchema = z.object({
  label: z.string().min(1, "Label opsi wajib diisi"),
  value: z.coerce.number().int().min(0).max(100),
});

const assessmentQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(3, "Pertanyaan minimal 3 karakter"),
  options: z.array(assessmentOptionSchema).min(2, "Minimal 2 opsi jawaban"),
});

const assessmentCategorySchema = z.object({
  max: z.coerce.number().int().min(1),
  label: z.string().min(1, "Label kategori wajib diisi"),
  summary: z.string().min(1, "Ringkasan kategori wajib diisi"),
  color: z.string().min(1),
});

const assessmentPayloadSchema = z.object({
  title: z.string().min(4, "Judul minimal 4 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  duration: z.coerce.number().int().min(1).max(120),
  isActive: z.coerce.boolean(),
  questions: z.array(assessmentQuestionSchema).min(1, "Minimal satu pertanyaan"),
  categories: z.array(assessmentCategorySchema).min(1, "Minimal satu kategori hasil"),
});

export async function createAssessmentAction(formData: FormData) {
  const admin = await requireSuperadmin();

  let payload: unknown = {};
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    redirect("/admin/asesmen/buat?error=Format+data+asesmen+tidak+valid");
  }

  const parsed = assessmentPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Data asesmen tidak valid";
    redirect(`/admin/asesmen/buat?error=${encodeURIComponent(message)}`);
  }

  const data = parsed.data;
  const maxScore = data.questions.reduce(
    (total, question) =>
      total + Math.max(...question.options.map((option) => option.value)),
    0
  );

  const baseSlug = slugify(data.title) || "asesmen-baru";
  let slug = baseSlug;
  let counter = 1;
  while (await db.assessment.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  await db.assessment.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      duration: data.duration,
      questions: JSON.stringify(data.questions),
      scoring: JSON.stringify({
        maxScore,
        categories: [...data.categories].sort((a, b) => a.max - b.max),
      }),
      isActive: data.isActive,
    },
  });

  await logActivity(admin.id, "ASSESSMENT_CREATED", `${data.title} (${slug})`);
  revalidatePath("/admin/asesmen");
  revalidatePath("/psikotes");
  revalidateTag("assessments");
  redirect(`/admin/asesmen?ok=${encodeURIComponent("Asesmen baru berhasil dibuat")}`);
}

export async function toggleAssessmentAction(formData: FormData) {
  const admin = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const assessment = await db.assessment.findUnique({ where: { id } });
  if (!assessment) return;

  await db.assessment.update({
    where: { id },
    data: { isActive: !assessment.isActive },
  });

  await logActivity(
    admin.id,
    "ASSESSMENT_TOGGLED",
    `${assessment.title} → ${!assessment.isActive ? "aktif" : "nonaktif"}`
  );

  revalidatePath("/admin/asesmen");
  revalidatePath("/psikotes");
  revalidateTag("assessments");
}

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().max(2000),
});

export async function saveSettingAction(formData: FormData) {
  await requireSuperadmin();
  const parsed = settingSchema.safeParse({
    key: String(formData.get("key") ?? ""),
    value: String(formData.get("value") ?? ""),
  });
  if (!parsed.success) return;

  await db.setting.upsert({
    where: { key: parsed.data.key },
    update: { value: parsed.data.value },
    create: { key: parsed.data.key, value: parsed.data.value },
  });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/");
  revalidateTag("settings");
  redirect("/admin/pengaturan?ok=Pengaturan+disimpan");
}

const COLOR_KEYS = new Set([
  "appearance.brand",
  "appearance.brandDark",
  "appearance.brandDeep",
  "appearance.mint",
  "appearance.accent",
]);

const COLOR_FALLBACK: Record<string, string> = {
  "appearance.brand": DEFAULT_BRANDING.colorBrand,
  "appearance.brandDark": DEFAULT_BRANDING.colorBrandDark,
  "appearance.brandDeep": DEFAULT_BRANDING.colorBrandDeep,
  "appearance.mint": DEFAULT_BRANDING.colorMint,
  "appearance.accent": DEFAULT_BRANDING.colorAccent,
};

export async function saveBrandingAction(formData: FormData) {
  const actor = await requireSuperadmin();

  const entries = BRANDING_KEYS.map((key) => {
    const raw = String(formData.get(key) ?? "").trim();
    const value =
      COLOR_KEYS.has(key) ? safeHex(raw, COLOR_FALLBACK[key]) : raw;
    return { key, value };
  });

  await db.$transaction(
    entries.map((entry) =>
      db.setting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: entry,
      })
    )
  );

  await logActivity(actor.id, "BRANDING_UPDATED", "Identitas, beranda & tampilan");
  revalidatePath("/");
  revalidatePath("/admin/pengaturan");
  revalidateTag("settings");
  redirect("/admin/pengaturan?ok=Branding+dan+beranda+disimpan");
}

export async function sendTestNotificationAction() {
  const admin = await requireAdmin();
  const now = new Date().toLocaleString("id-ID");

  await notifyAdmin({
    title: "Tes Notifikasi Admin",
    emailLines: [
      "Ini adalah pesan uji dari Admin Console.",
      "",
      `Waktu : ${now}`,
      `Admin : ${admin.name} (${admin.email})`,
      "",
      "Jika pesan ini diterima, pipeline notifikasi email sudah berjalan.",
    ],
    whatsappMessage: [
      "*Konseling Trenggalek* — Tes Notifikasi",
      "",
      "Pipeline notifikasi WhatsApp admin berhasil terhubung.",
      `Waktu: ${now}`,
    ].join("\n"),
  });

  await logActivity(admin.id, "ADMIN_TEST_NOTIFICATION", "Tes email + WhatsApp admin");

  revalidatePath("/admin/pengaturan");
  redirect("/admin/pengaturan?ok=Notifikasi+tes+dikirim");
}
