import type { Config, Context } from "@netlify/functions";
import { z } from "zod";
import { authorizedConnieWebhook } from "./_shared/connie-webhook-auth";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

type IngestRunStatus = {
  id: string;
  status: "running" | "succeeded" | "partial" | "failed";
  started_at: string;
  finished_at: string | null;
  sources_total: number;
  sources_succeeded: number;
  sources_changed: number;
  error_count: number;
  details: Record<string, unknown>;
};

type SocialPostStatus = {
  id: string;
  url: string;
  review_status: "unreviewed" | "reviewed" | "flagged" | "excluded";
  provider: string | null;
  model: string | null;
};

export default async function connieSocialStatus(request: Request, context: Context) {
  const webhookSecret = Netlify.env.get("CONNIE_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) return new Response("Connie Social is not configured", { status: 503 });
  if (!authorizedConnieWebhook(request, webhookSecret)) return new Response("Unauthorized", { status: 401 });

  const parsedRunId = z.uuid().safeParse(context.params.run_id);
  if (!parsedRunId.success) return Response.json({ error: "Invalid run id" }, { status: 400 });

  const runQuery = postgrestQuery({
    select: "id,status,started_at,finished_at,sources_total,sources_succeeded,sources_changed,error_count,details",
    id: `eq.${parsedRunId.data}`,
    limit: "1",
  });
  const [run] = await supabaseRequest<IngestRunStatus[]>(`ingest_runs?${runQuery}`);
  if (!run) return Response.json({ error: "Run not found" }, { status: 404 });

  const postQuery = postgrestQuery({
    select: "id,url,review_status,provider,model",
    ingest_run_id: `eq.${run.id}`,
    limit: "1",
  });
  const [post] = await supabaseRequest<SocialPostStatus[]>(`social_posts?${postQuery}`);

  return Response.json({
    run_id: run.id,
    status: run.status,
    started_at: run.started_at,
    completed_at: run.finished_at,
    sources_succeeded: run.sources_succeeded,
    posts_stored: run.sources_changed,
    error_count: run.error_count,
    details: run.details,
    result: post ?? null,
  });
}

export const config: Config = {
  path: "/api/connie/social/runs/:run_id",
  method: "GET",
};
