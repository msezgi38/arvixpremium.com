import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/Layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arvix Premium - Profesyonel Spor Ekipmanları",
  description: "Profesyonel spor salonları için yüksek kalitede fitness ekipmanları. Kendi markanızla özelleştirin.",
  keywords: "spor ekipmanları, fitness, profesyonel gym ekipmanları, plaka yüklemeli, kardiyo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

