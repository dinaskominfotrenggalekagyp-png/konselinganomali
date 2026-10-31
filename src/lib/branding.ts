export type Branding = {
  siteName: string;
  tagline: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroImage: string;
  valueImage: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  trustText: string;
  colorBrand: string;
  colorBrandDark: string;
  colorBrandDeep: string;
  colorMint: string;
  colorAccent: string;
};

export const DEFAULT_BRANDING: Branding = {
  siteName: "Konseling Trenggalek",
  tagline: "Psikologi & Kesehatan Mental",
  logo: "",
  contactEmail: "rproselegends@gmail.com",
  contactPhone: "+62 853-3526-8258",
  contactAddress: "Jl. Raya Trenggalek No. 123, Trenggalek, Jawa Timur 66311",
  heroBadge: "Platform Psikologi Terintegrasi",
  heroTitle: "Kesehatan Mental",
  heroAccent: "di Ujung Jari.",
  heroDescription:
    "Transisi mulus dari pencarian informasi ke tindakan nyata. Akses layanan psikologi profesional, kelola jadwal, dan pantau progres wellness Anda dalam satu platform terintegrasi.",
  heroImage:
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2200&auto=format&fit=crop",
  valueImage:
    "https://images.unsplash.com/photo-1746513930405-005d20013dd6?w=900&h=1100&auto=format&fit=crop&q=80",
  heroPrimaryLabel: "Konseling Premium",
  heroPrimaryHref: "/klinik",
  heroSecondaryLabel: "Cek Kondisi Anda",
  heroSecondaryHref: "/psikotes",
  trustText: "Dipercaya oleh 120+ institusi & komunitas",
  colorBrand: "#0ea5e9",
  colorBrandDark: "#0369a1",
  colorBrandDeep: "#0c4a6e",
  colorMint: "#e0f2fe",
  colorAccent: "#7dd3fc",
};

/** Daftar key setting yang dipakai untuk branding & beranda. */
export const BRANDING_KEYS = [
  "site.name",
  "site.tagline",
  "site.logo",
  "contact.email",
  "contact.phone",
  "contact.address",
  "home.badge",
  "home.title",
  "home.accent",
  "home.description",
  "home.image",
  "home.valueImage",
  "home.primaryLabel",
  "home.primaryHref",
  "home.secondaryLabel",
  "home.secondaryHref",
  "home.trust",
  "appearance.brand",
  "appearance.brandDark",
  "appearance.brandDeep",
  "appearance.mint",
  "appearance.accent",
] as const;

const HEX = /^#[0-9a-f]{6}$/i;

export function safeHex(value: string, fallback: string) {
  return HEX.test(value) ? value : fallback;
}

export function hexToChannels(hex: string) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean;
  return `${parseInt(value.slice(0, 2), 16)} ${parseInt(value.slice(2, 4), 16)} ${parseInt(value.slice(4, 6), 16)}`;
}

export function brandingCssVars(branding: Branding) {
  return `:root{--brand:${hexToChannels(branding.colorBrand)};--brand-dark:${hexToChannels(
    branding.colorBrandDark
  )};--brand-deep:${hexToChannels(branding.colorBrandDeep)};--brand-mint:${hexToChannels(
    branding.colorMint
  )};--brand-accent:${hexToChannels(branding.colorAccent)};}`;
}
