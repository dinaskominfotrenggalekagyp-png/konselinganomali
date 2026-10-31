"use client";

import { useState } from "react";
import {
  Building2,
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
import { prepareImageForUpload } from "@/lib/image-client";
import {
  DEFAULT_BRANDING,
  type Branding,
} from "@/lib/branding";

type Props = {
  values: Partial<Record<keyof Branding, string>>;
};

export function BrandingSettingsForm({ values }: Props) {
  const get = (key: keyof Branding) =>
    values[key]?.trim() || DEFAULT_BRANDING[key];

  const [logo, setLogo] = useState(get("logo"));
  const [heroImage, setHeroImage] = useState(get("heroImage"));
  const [valueImage, setValueImage] = useState(get("valueImage"));
  const [uploading, setUploading] = useState<"" | "logo" | "hero" | "value">("");
  const [error, setError] = useState("");

  async function upload(
    file: File,
    target: "logo" | "hero" | "value",
    setter: (value: string) => void
  ) {
    setUploading(target);
    setError("");
    try {
      const prepared = await prepareImageForUpload(file);
      const body = new FormData();
      body.append("file", prepared);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah gambar");
      setter(data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Gagal mengunggah gambar"
      );
    } finally {
      setUploading("");
    }
  }

  return (
    <form action={saveBrandingAction} className="space-y-4">
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
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
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
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
                  onChange={(event) => setLogo(event.target.value)}
                  placeholder="/uploads/logo.png atau https://..."
                  className="field"
                />
                <label className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand">
                  {uploading === "logo" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Unggah
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void upload(file, "logo", setLogo);
                    }}
                  />
                </label>
              </div>
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
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt="Pratinjau hero"
                  className="h-11 w-16 shrink-0 rounded-lg border border-line object-cover"
                />
              ) : null}
              <input
                id="hero-image"
                name="home.image"
                value={heroImage}
                onChange={(event) => setHeroImage(event.target.value)}
                placeholder="https://..."
                className="field"
              />
              <label className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand">
                {uploading === "hero" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Unggah
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file, "hero", setHeroImage);
                  }}
                />
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="value-image" className="label">Gambar bagian pendekatan</label>
            <div className="flex items-center gap-2">
              {valueImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={valueImage}
                  alt="Pratinjau pendekatan"
                  className="h-11 w-16 shrink-0 rounded-lg border border-line object-cover"
                />
              ) : null}
              <input
                id="value-image"
                name="home.valueImage"
                value={valueImage}
                onChange={(event) => setValueImage(event.target.value)}
                placeholder="https://..."
                className="field"
              />
              <label className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand">
                {uploading === "value" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Unggah
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file, "value", setValueImage);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="btn-primary btn-sm" disabled={Boolean(uploading)}>
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Simpan branding &amp; beranda
        </button>
        <p className="text-[9.5px] text-muted">
          Perubahan berlaku untuk situs publik, portal, dan admin console.
        </p>
      </div>
    </form>
  );
}
