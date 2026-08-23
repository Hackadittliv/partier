import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sakfragan.netlify.app"),
  title: "Sakfrågan",
  description: "Sök, jämför och förstå vad svenska partier faktiskt vill.",
  openGraph: {
    title: "Sakfrågan",
    description: "Sök, jämför och förstå svensk politik.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Sakfrågan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakfrågan",
    description: "Sök, jämför och förstå svensk politik.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon_192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon_512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple_touch_icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased">{children}</body>
    </html>
  );
}
