import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PRIME ARENA | The Next Level of Competition",
  description: "Centro oficial de gestión, organización y visualización de competiciones de eFootball. The Next Level of Competition.",
  icons: {
    icon: "/logo-prime-arena.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased tech-bg`}>
        {children}
      </body>
    </html>
  );
}
