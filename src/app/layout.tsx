import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "CineSync",
    template: "%s · CineSync",
  },
  description: "Plan films, sync met vrienden, nooit meer solo kijken.",
  applicationName: "CineSync",
  authors: [{ name: "CineSync Team" }],
  keywords: ["films", "cinema", "sociale app", "watchlist", "vrienden"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineSync",
  },
  openGraph: {
    type: "website",
    siteName: "CineSync",
    title: "CineSync",
    description: "Plan films, sync met vrienden, nooit meer solo kijken.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineSync",
    description: "Plan films, sync met vrienden, nooit meer solo kijken.",
  },
};

export const viewport: Viewport = {
  themeColor: "#db2777",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={geist.variable}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
