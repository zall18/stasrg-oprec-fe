import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#274432",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | STAS-RG Recruitment",
    default: "Sistem Rekrutmen STAS-RG | Riset & Magang",
  },
  description:
    "Portal resmi pendaftaran Golden Candidate dan Open Recruitment (Oprec) STAS-RG (Smart Transportation and Autonomous Systems Research Group). Bergabunglah dalam riset teknologi transportasi masa depan.",
  keywords: [
    "STAS-RG",
    "Rekrutmen STAS-RG",
    "Oprec Mahasiswa Riset",
    "Magang Lab STAS-RG",
    "Golden Candidate",
    "Autonomous Systems",
  ],
  authors: [{ name: "STAS-RG Team" }],
  openGraph: {
    title: "Sistem Rekrutmen STAS-RG",
    description:
      "Daftar sebagai Mahasiswa Riset atau Magang di Laboratorium Riset STAS-RG.",
    type: "website",
    locale: "id_ID",
    siteName: "STAS-RG Recruitment System",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F2F4F0] text-[#1A201C] overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
