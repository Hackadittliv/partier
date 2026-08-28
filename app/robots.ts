import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/granskning", "/api/", "/.netlify/"],
    },
    sitemap: "https://sakfragan.nu/sitemap.xml",
    host: "https://sakfragan.nu",
  };
}
