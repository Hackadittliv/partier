import type { Metadata } from "next";

import ReviewPanel from "./review-panel";

export const metadata: Metadata = {
  title: "Redaktionell granskning | Sakfrågan",
  description: "Säker redaktionell granskning av upptäckta ändringar i partiernas officiella källor.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReviewPage() {
  return <ReviewPanel />;
}
