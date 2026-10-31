import "server-only";
import { db } from "@/lib/db";
import {
  DEFAULT_BRANDING,
  safeHex,
  type Branding,
} from "@/lib/branding";

export async function getSettingsMap() {
  const rows = await db.setting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<
    string,
    string
  >;
}

export async function getBranding(): Promise<Branding> {
  const values = await getSettingsMap();
  const pick = (key: string, fallback: string) => values[key]?.trim() || fallback;

  return {
    siteName: pick("site.name", DEFAULT_BRANDING.siteName),
    tagline: pick("site.tagline", DEFAULT_BRANDING.tagline),
    logo: pick("site.logo", DEFAULT_BRANDING.logo),
    contactEmail: pick("contact.email", DEFAULT_BRANDING.contactEmail),
    contactPhone: pick("contact.phone", DEFAULT_BRANDING.contactPhone),
    contactAddress: pick("contact.address", DEFAULT_BRANDING.contactAddress),
    heroBadge: pick("home.badge", DEFAULT_BRANDING.heroBadge),
    heroTitle: pick("home.title", DEFAULT_BRANDING.heroTitle),
    heroAccent: pick("home.accent", DEFAULT_BRANDING.heroAccent),
    heroDescription: pick("home.description", DEFAULT_BRANDING.heroDescription),
    heroImage: pick("home.image", DEFAULT_BRANDING.heroImage),
    valueImage: pick("home.valueImage", DEFAULT_BRANDING.valueImage),
    heroPrimaryLabel: pick(
      "home.primaryLabel",
      DEFAULT_BRANDING.heroPrimaryLabel
    ),
    heroPrimaryHref: pick("home.primaryHref", DEFAULT_BRANDING.heroPrimaryHref),
    heroSecondaryLabel: pick(
      "home.secondaryLabel",
      DEFAULT_BRANDING.heroSecondaryLabel
    ),
    heroSecondaryHref: pick(
      "home.secondaryHref",
      DEFAULT_BRANDING.heroSecondaryHref
    ),
    trustText: pick("home.trust", DEFAULT_BRANDING.trustText),
    colorBrand: safeHex(
      pick("appearance.brand", DEFAULT_BRANDING.colorBrand),
      DEFAULT_BRANDING.colorBrand
    ),
    colorBrandDark: safeHex(
      pick("appearance.brandDark", DEFAULT_BRANDING.colorBrandDark),
      DEFAULT_BRANDING.colorBrandDark
    ),
    colorBrandDeep: safeHex(
      pick("appearance.brandDeep", DEFAULT_BRANDING.colorBrandDeep),
      DEFAULT_BRANDING.colorBrandDeep
    ),
    colorMint: safeHex(
      pick("appearance.mint", DEFAULT_BRANDING.colorMint),
      DEFAULT_BRANDING.colorMint
    ),
    colorAccent: safeHex(
      pick("appearance.accent", DEFAULT_BRANDING.colorAccent),
      DEFAULT_BRANDING.colorAccent
    ),
  };
}
