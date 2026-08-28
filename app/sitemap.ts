import type { MetadataRoute } from "next";
import { lastUpdatedIso, parties, topics } from "./data";

const siteUrl = "https://sakfragan.nu";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${lastUpdatedIso}T12:00:00+02:00`);

  return [
    { url: siteUrl, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/partier`, lastModified, changeFrequency: "daily", priority: 0.9 },
    ...parties.map((party) => ({
      url: `${siteUrl}/partier/${party.id}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/sakfragor`, lastModified, changeFrequency: "daily", priority: 0.9 },
    ...topics.map((topic) => ({
      url: `${siteUrl}/sakfragor/${topic.id}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/om`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
