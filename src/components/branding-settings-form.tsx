"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ImageIcon,
  LayoutTemplate,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { saveBrandingAction } from "@/app/admin/actions";
import { errorMessage, isNextRedirectError } from "@/lib/action-errors";
import { fileSizeKb, prepareImageForUpload } from "@/lib/image-client";
import {
  DEFAULT_BRANDING,
  type Branding,
} from "@/lib/branding";

type Props = {
  values: Partial<Record<keyof Branding, string>>;
};

type ImageTarget = "logo" | "hero" | "value";

const FIELD_NAME: Record<ImageTarget, string> = {
  logo: "site.logo",
  hero: "home.image",
  value: "home.valueImage",
};

export function BrandingSettingsForm({ values }: Props) {
  const get = (key: keyof Branding) =>
    values[key]?.trim() || DEFAULT_BRANDING[key];

  const [logo, setLogo] = useState(get("logo"));
  const [heroImage, setHeroImage] = useState(get("heroImage"));
  const [valueImage, setValueImage] = useState(get("valueImage"));
  const [pending, setPending] = useState<Partial<Record<ImageTarget, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<ImageTarget, string>>>({});
  const [compressing, setCompressing] = useState<ImageTarget | "">("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    { tone: "info" | "ok" | "error"; text: string } | null
  >(null);

  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  // Bersihkan object URL preview saat komponen dilepas.
  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  function clearPending(target: ImageTarget) {
    setPending((current) => {
      const next = { ...current };
      delete next[target];
      return next;
    });
    setPreviews((current) => {
      if (current[target]) URL.revokeObjectURL(current[target]!);
      const next = { ...current };
      delete next[target];
      return next;
    });
  }

  /** Pilih gambar → kompres di browser. Tidak diunggah sampai Simpan diklik. */
  async function chooseImage(target: ImageTarget, file: File) {
    setCompressing(target);
    setStatus({ tone: "info", text: "Mengompres gambar..." });
    try {
      const prepared = await prepareImageForUpload(file);
      clearPending(target);
      setPending((current) => ({ ...current, [target]: prepared }));
      setPreviews((current) => ({
        ...current,
        [target]: URL.createObjectURL(prepared),
      }));
      setStatus({
        tone: "ok",
        text: `Gambar siap (${fileSizeKb(prepared)} KB). Belum diunggah — klik Simpan untuk menyimpan.`,
      });
    } catch (uploadError) {
      clearPending(target);
      setStatus({
        tone: "error",
        text: errorMessage(uploadError, "Gagal menyiapkan gambar."),
      });
    } finally {
      setCompressing("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || compressing) return;

    const form = event.currentTarget;
    const targets = Object.keys(pending) as ImageTarget[];
    setSaving(true);
    setStatus({
      tone: "info",
      text:
        targets.length > 0
          ? "Mengunggah gambar lalu menyimpan pengaturan..."
          : "Menyimpan pengaturan...",
    });

    try {
      const formData = new FormData(form);

      for (const target of targets) {
        const file = pending[target];
        if (!file) continue;
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error ?? "Gagal mengunggah gambar");
        }
        formData.set(FIELD_NAME[target], data.url);
      }

      await saveBrandingAction(formData);
      // Sukses: server action redirect ke halaman dengan notifikasi.
    } catch (uploadError) {
      if (isNextRedirectError(uploadError)) throw uploadError;
      setSaving(false);
      setStatus({
        tone: "error",
        text: errorMessage(uploadError, "Gagal menyimpan pengaturan. Coba lagi."),
      });
    }
  }
  return (
    <form action={saveBrandingAction} onSubmit={handleSubmit} className="space-y-4">
      {status && (
        <p
          role="status"
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-[11px] font-medium ${
            status.tone === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : status.tone === "error"
                ? "bg-rose-50 text-rose-700"
                : "bg-surface text-muted"
          }`}
        >
          {status.tone === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : status.tone === "error" ? (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" />
          )}
          {status.text}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-deep">
            <Building2 className="h-4 w-4 text-brand" /> Identitas &amp; logo
          </h2>
          <p className="mt-1 text-[10px] text-muted">
            Nama, logo, dan kontak ini dipakai di header, footer, serta halaman publik.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="brand-site-name" className="label">Nama situs</label>
              <input
                id="brand-site-name"
                name="site.name"
                defaultValue={get("siteName")}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="brand-site-tagline" className="label">Tagline</label>
              <input
                id="brand-site-tagline"
                name="site.tagline"
                defaultValue={get("tagline")}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="brand-logo" className="label">Logo (URL atau unggah)</label>
              <div className="flex items-center gap-2">
                {previews.logo || logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previews.logo ?? logo}
                    alt="Pratinjau logo"
                    className="h-11 w-11 shrink-0 rounded-xl border border-line object-contain"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                )}
                <input
                  id="brand-logo"
                  name="site.logo"
                  value={logo}
                  onChange={(event) => {
                    setLogo(event.target.value);
                    clearPending("logo");
                    setStatus(null);
                  }}
                  placeholder="/uploads/logo.png atau https://..."
                  className="field"
                />
                <label className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand">
                  {compressing === "logo" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Unggah
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={saving}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void chooseImage("logo", file);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {pending.logo && (
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-amber-600">
                  Logo belum diunggah — klik Simpan
                </p>
              )}
              <p className="mt-1 text-[9px] text-muted">
                Kosongkan untuk memakai logo bawaan.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="brand-contact-email" className="label">
                  <Mail className="mr-1 inline h-3 w-3" /> Email kontak
                </label>
                <input
                  id="brand-contact-email"
                  name="contact.email"
                  type="email"
                  defaultValue={get("contactEmail")}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="brand-contact-phone" className="label">
                  <Phone className="mr-1 inline h-3 w-3" /> Telepon / WhatsApp
                </label>
                <input
                  id="brand-contact-phone"
                  name="contact.phone"
                  defaultValue={get("contactPhone")}
                  className="field"
                />
              </div>
            </div>
            <div>
              <label htmlFor="brand-contact-address" className="label">
                <MapPin className="mr-1 inline h-3 w-3" /> Alamat klinik
              </label>
              <input
                id="brand-contact-address"
                name="contact.address"
                defaultValue={get("contactAddress")}
                className="field"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-deep">
            <Palette className="h-4 w-4 text-brand" /> Tampilan &amp; warna
          </h2>
          <p className="mt-1 text-[10px] text-muted">
            Warna utama situs, tombol, dan aksen. Perubahan langsung terlihat di
            seluruh halaman.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { key: "appearance.brand", label: "Warna utama", value: get("colorBrand") },
              { key: "appearance.brandDark", label: "Warna tombol", value: get("colorBrandDark") },
              { key: "appearance.brandDeep", label: "Warna gelap", value: get("colorBrandDeep") },
              { key: "appearance.mint", label: "Latar lembut", value: get("colorMint") },
              { key: "appearance.accent", label: "Aksen terang", value: get("colorAccent") },
            ].map((color) => (
              <div key={color.key}>
                <label htmlFor={`color-${color.key}`} className="label">
                  {color.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`color-${color.key}`}
                    name={color.key}
                    type="color"
                    defaultValue={color.value}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
                  />
                  <span className="font-mono text-[10px] text-muted">
                    {color.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-brand-mint/60 p-3.5 text-[9.5px] leading-relaxed text-brand-dark">
            <p className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-3 w-3" /> Pratinjau warna
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand px-3 py-1 text-[9px] font-semibold text-white">
                Tombol utama
              </span>
              <span className="rounded-full bg-brand-dark px-3 py-1 text-[9px] font-semibold text-white">
                Tombol gelap
              </span>
              <span className="rounded-full bg-brand-mint px-3 py-1 text-[9px] font-semibold text-brand-dark">
                Latar lembut
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-deep">
          <LayoutTemplate className="h-4 w-4 text-brand" /> Konten beranda
        </h2>
        <p className="mt-1 text-[10px] text-muted">
          Atur teks hero, gambar, dan tombol utama pada halaman beranda.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="hero-badge" className="label">Label kecil di atas judul</label>
            <input
              id="hero-badge"
              name="home.badge"
              defaultValue={get("heroBadge")}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="hero-trust" className="label">Teks kepercayaan</label>
            <input
              id="hero-trust"
              name="home.trust"
              defaultValue={get("trustText")}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="hero-title" className="label">Judul utama</label>
            <input
              id="hero-title"
              name="home.title"
              defaultValue={get("heroTitle")}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="hero-accent" className="label">Baris judul beraksen</label>
            <input
              id="hero-accent"
              name="home.accent"
              defaultValue={get("heroAccent")}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="hero-description" className="label">Deskripsi hero</label>
            <textarea
              id="hero-description"
              name="home.description"
              rows={3}
              defaultValue={get("heroDescription")}
              className="field resize-none"
            />
          </div>

          <div>
            <label htmlFor="hero-primary-label" className="label">Tombol utama — teks</label>
            <input
              id="hero-primary-label"
              name="home.primaryLabel"
              defaultValue={get("heroPrimaryLabel")}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="hero-primary-href" className="label">Tombol utama — tautan</label>
            <input
              id="hero-primary-href"
              name="home.primaryHref"
              defaultValue={get("heroPrimaryHref")}
              className="field font-mono text-[11px]"
            />
          </div>
          <div>
            <label htmlFor="hero-secondary-label" className="label">Tombol kedua — teks</label>
            <input
              id="hero-secondary-label"
              name="home.secondaryLabel"
              defaultValue={get("heroSecondaryLabel")}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="hero-secondary-href" className="label">Tombol kedua — tautan</label>
            <input
              id="hero-secondary-href"
              name="home.secondaryHref"
              defaultValue={get("heroSecondaryHref")}
              className="field font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="hero-image" className="label">Gambar hero</label>
            <div className="flex items-center gap-2">
              {previews.hero || heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previews.hero ?? heroImage}
                  alt="Pratinjau hero"
                  className="h-11 w-16 shrink-0 rounded-lg border border-line object-cover"
                />
              ) : null}
              <input
                id="hero-image"
                name="home.image"
                value={heroImage}
                onChange={(event) => {
                  setHeroImage(event.target.value);
                  clearPending("hero");
                  setStatus(null);
                }}
                placeholder="https://..."
                className="field"
              />
              <label className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand">
                {compressing === "hero" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Unggah
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={saving}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void chooseImage("hero", file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            {pending.hero && (
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-amber-600">
                Belum diunggah — klik Simpan
              </p>
            )}
          </div>
          <div>
            <label htmlFor="value-image" className="label">Gambar bagian pendekatan</label>
            <div className="flex items-center gap-2">
              {previews.value || valueImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previews.value ?? valueImage}
                  alt="Pratinjau pendekatan"
                  className="h-11 w-16 shrink-0 rounded-lg border border-line object-cover"
                />
              ) : null}
              <input
                id="value-image"
                name="home.valueImage"
                value={valueImage}
                onChange={(event) => {
                  setValueImage(event.target.value);
                  clearPending("value");
                  setStatus(null);
                }}
                placeholder="https://..."
                className="field"
              />
              <label className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand">
                {compressing === "value" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Unggah
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={saving}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void chooseImage("value", file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            {pending.value && (
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-amber-600">
                Belum diunggah — klik Simpan
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="btn-primary btn-sm"
          disabled={saving || Boolean(compressing)}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Menyimpan..." : "Simpan branding & beranda"}
        </button>
        <p className="text-[9.5px] text-muted">
          Gambar dikompres ke ±100 KB dan baru diunggah saat Simpan diklik.
        </p>
      </div>
    </form>
  );
}
