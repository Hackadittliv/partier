import type { Config, Context } from "@netlify/functions";

import { runXCollection } from "./_shared/social-x-collection";
import { scheduledStockholmSlot } from "./_shared/x-collector";

export default async function connieSocialSchedule(_request: Request, context: Context) {
  if (Netlify.env.get("CONNIE_SOCIAL_COLLECTION_ENABLED") !== "true") {
    console.log("Connie Socials automatiska X-insamling är inte aktiverad.");
    return;
  }

  const slot = scheduledStockholmSlot(new Date());
  if (!slot) return;

  const result = await runXCollection(context, {
    triggerKind: "scheduled",
    dryRun: false,
    collectionSlot: `connie-social:${slot}`,
  });
  console.log(
    `Connie Social X: ${result.postsFound} hittade, ${result.postsQueued} köade, ${result.duplicatesSkipped} dubletter.`,
  );
}

export const config: Config = {
  schedule: "5 * * * *",
};
