import { timingSafeEqual } from "node:crypto";

import type { Config, Context } from "@netlify/functions";

import { runSourceCheck } from "./_shared/source-check";

function authorized(request: Request, expectedSecret: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const supplied = Buffer.from(suppliedSecret);
  const expected = Buffer.from(expectedSecret);

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export default async function manualSourceCheck(request: Request, context: Context) {
  const triggerSecret = Netlify.env.get("SAKFRAGAN_MANUAL_TRIGGER_SECRET")?.trim();

  if (!triggerSecret) {
    return new Response("Manual source check is not configured", { status: 503 });
  }

  if (!authorized(request, triggerSecret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (Netlify.env.get("SAKFRAGAN_AUTOMATION_ENABLED") !== "true") {
    return Response.json({ error: "Automation is not enabled" }, { status: 409 });
  }

  try {
    const result = await runSourceCheck(context, { triggerKind: "manual" });
    return Response.json(result);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return Response.json({ error: "Source check failed" }, { status: 500 });
  }
}

export const config: Config = {
  path: "/api/automation/run",
  method: "POST",
};
