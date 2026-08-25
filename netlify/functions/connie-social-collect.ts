import type { Config, Context } from "@netlify/functions";
import { z } from "zod";

import { authorizedConnieWebhook } from "./_shared/connie-webhook-auth";
import { runXCollection } from "./_shared/social-x-collection";

const collectRequestSchema = z.object({
  dry_run: z.boolean().default(true),
  max_posts: z.number().int().min(1).max(100).default(20),
});

export default async function connieSocialCollect(request: Request, context: Context) {
  const collectorSecret = Netlify.env.get("CONNIE_SOCIAL_COLLECTOR_SECRET")?.trim();
  if (!collectorSecret) return new Response("Connie Social collector is not configured", { status: 503 });
  if (!authorizedConnieWebhook(request, collectorSecret)) return new Response("Unauthorized", { status: 401 });

  try {
    const input = collectRequestSchema.parse(await request.json());
    if (!input.dry_run && Netlify.env.get("CONNIE_SOCIAL_COLLECTION_ENABLED") !== "true") {
      return Response.json({ error: "Automatic X collection is not enabled" }, { status: 409 });
    }

    const result = await runXCollection(context, {
      triggerKind: "manual",
      dryRun: input.dry_run,
      maxPosts: input.max_posts,
    });
    return Response.json(result, { status: result.started ? 200 : 409 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    console.error("Connie Social X collection failed", error instanceof Error ? error.message : error);
    return Response.json({ error: "Connie Social X collection failed" }, { status: 502 });
  }
}

export const config: Config = {
  path: "/api/connie/social/collect",
  method: "POST",
};
