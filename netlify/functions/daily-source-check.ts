import type { Config, Context } from "@netlify/functions";

import { runSourceCheck } from "./_shared/source-check";

export default async function dailySourceCheck(_request: Request, context: Context) {
  if (Netlify.env.get("SAKFRAGAN_AUTOMATION_ENABLED") !== "true") {
    console.log("Sakfrågans automatiska källkontroll är inte aktiverad.");
    return;
  }

  await runSourceCheck(context, { triggerKind: "scheduled" });
}

export const config: Config = {
  schedule: "15 2 * * *",
};
