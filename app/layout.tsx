import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://sakfragan.nu";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F3EB",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sakfrågan: jämför svenska partier inför valet 2026",
    template: "%s | Sakfrågan",
  },
  description: "Jämför vad svenska partier vill inom ekonomi, vård, skola, migration, klimat, energi och fler sakfrågor. Alla sammanfattningar länkar till officiella källor.",
  alternates: {
    canonical: "/",
  },
  applicationName: "Sakfrågan",
  authors: [{ name: "Sakfrågan", url: siteUrl }],
  creator: "Sakfrågan",
  publisher: "Sakfrågan",
  category: "politik",
  appleWebApp: {
    capable: true,
    title: "Sakfrågan",
    statusBarStyle: "default",
  },
  keywords: ["svenska partier", "valet 2026", "partiprogram", "valmanifest", "jämför partier", "sakfrågor"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: siteUrl,
    siteName: "Sakfrågan",
    title: "Sakfrågan: jämför svenska partier inför valet 2026",
    description: "Politik på vanlig svenska, med neutrala sammanfattningar och officiella primärkällor.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Sakfrågan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakfrågan: jämför svenska partier inför valet 2026",
    description: "Politik på vanlig svenska, med neutrala sammanfattningar och officiella primärkällor.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon_192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon_512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple_touch_icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "Sakfrågan",
                  url: siteUrl,
                  logo: `${siteUrl}/icon_512.png`,
                  description: "En neutral jämförelsetjänst för svenska partiers publicerade politik.",
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: "Sakfrågan",
                  inLanguage: "sv-SE",
                  publisher: { "@id": `${siteUrl}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${siteUrl}/?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
