import type { Metadata } from "next";
import { Inter, Noto_Serif_Display } from "next/font/google";
import { appBaseUrl } from "@/lib/app-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Noto_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: {
    default: "Konseling Trenggalek — Asesmen Psikologi & Kesehatan Mental",
    template: "%s — Konseling Trenggalek",
  },
  description:
    "Konseling Trenggalek membantu individu, keluarga, dan komunitas melalui asesmen psikologi, konseling, dan mediasi berbasis data.",
  keywords: [
    "konseling psikologi",
    "psikolog online",
    "asesmen psikologi",
    "tes minat bakat",
    "kesehatan mental",
  ],
  openGraph: {
    title: "Konseling Trenggalek — Kesehatan Mental di Ujung Jari",
    description:
      "Akses layanan psikologi profesional, kelola jadwal, dan pantau progres wellness Anda dalam satu platform terintegrasi.",
    type: "website",
    locale: "id_ID",
    siteName: "Konseling Trenggalek",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
