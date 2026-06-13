import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "DictaTodo - Organiza tu día con tu voz",
  description: "Crea tu lista de tareas de forma rápida dictando con tu voz. Divide tareas con palabras clave y organízate fácilmente.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DictaTodo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={outfit.variable}>
        {/* Glow orbs in background */}
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
        {children}
      </body>
    </html>
  );
}
