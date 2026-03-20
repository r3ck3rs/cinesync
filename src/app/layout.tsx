import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineSync",
  description: "Go to the movies together — spontaneously.",
  manifest: "/manifest.json",
  themeColor: "#7c6ff7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineSync",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${fraunces.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
