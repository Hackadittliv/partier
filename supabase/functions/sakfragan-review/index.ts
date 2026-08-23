declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const SCHEMA = "sakfragan";
const ADMIN_TOKEN_HASH = "bc4050a977986f3a331efb1ac6b174090abbb1855173cc7bf3677d825a09c330";
const ALLOWED_ORIGINS = new Set([
  "https://sakfragan.netlify.app",
  "https://sakfragan.r4cgcty6q2.chatgpt.site",
]);

type ReviewItem = {
  id: string;
  item_kind: string;
  item_id: string;
  party_id: string | null;
  title: string;
  rationale: string | null;
  priority: number;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer: string | null;
  review_notes: string | null;
};

type DetectedChange = {
  id: string;
  source_id: string;
  before_snapshot_id: string | null;
  after_snapshot_id: string | null;
  change_kind: string;
  materiality: string;
  summary: string | null;
  diff_text: string | null;
  status: string;
  detected_at: string;
};

type Source = {
  id: string;
  party_id: string;
  title: string;
  canonical_url: string;
  source_kind: string;
};

type Snapshot = {
  id: string;
  title: string | null;
  content_text: string | null;
  content_markdown: string | null;
  fetched_at: string;
};

type Party = {
  id: string;
  name: string;
  short_name: string;
  ideology: string;
  color: string;
  emblem_path: string | null;
};

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return {
    "access-control-allow-origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://sakfragan.netlify.app",
    "access-control-allow-headers": "content-type, x-sakfragan-admin",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-max-age": "86400",
    "content-type": "application/json; charset=utf-8",
    "vary": "origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request),
  });
}

function encodeHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function tokenIsValid(token: string) {
  if (!token || ADMIN_TOKEN_HASH.length !== 64) return false;

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const actual = encodeHex(new Uint8Array(digest));
  let difference = actual.length ^ ADMIN_TOKEN_HASH.length;

  for (let index = 0; index < Math.max(actual.length, ADMIN_TOKEN_HASH.length); index += 1) {
    difference |= (actual.charCodeAt(index) || 0) ^ (ADMIN_TOKEN_HASH.charCodeAt(index) || 0);
  }

  return difference === 0;
}

function requiredEnvironment(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Miljövariabeln ${name} saknas.`);
  return value;
}

async function database<T>(path: string, init: RequestInit = {}) {
  const url = requiredEnvironment("SUPABASE_URL");
  const serviceRoleKey = requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("authorization", `Bearer ${serviceRoleKey}`);
  headers.set("accept-profile", SCHEMA);
  headers.set("content-profile", SCHEMA);

  if (init.body) headers.set("content-type", "application/json");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Databasanropet misslyckades med status ${response.status}: ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function inFilter(values: string[]) {
  return `in.(${values.map((value) => `"${value.replaceAll('"', '\\"')}"`).join(",")})`;
}

async function loadQueue() {
  const items = await database<ReviewItem[]>(
    "review_items?select=*&status=in.(pending,in_review)&order=priority.desc,created_at.asc&limit=100",
  );

  if (!items.length) {
    return { items: [], counts: { pending: 0, inReview: 0, urgent: 0 } };
  }

  const changeIds = items.filter((item) => item.item_kind === "change").map((item) => item.item_id);
  const partyIds = items.map((item) => item.party_id).filter((value): value is string => Boolean(value));
  const changes = changeIds.length
    ? await database<DetectedChange[]>(
      `detected_changes?select=*&id=${encodeURIComponent(inFilter(changeIds))}`,
    )
    : [];
  const sourceIds = changes.map((change) => change.source_id);
  const snapshotIds = changes.flatMap((change) =>
    [change.before_snapshot_id, change.after_snapshot_id].filter((value): value is string => Boolean(value))
  );
  const sources = sourceIds.length
    ? await database<Source[]>(`sources?select=id,party_id,title,canonical_url,source_kind&id=${encodeURIComponent(inFilter(sourceIds))}`)
    : [];
  const snapshots = snapshotIds.length
    ? await database<Snapshot[]>(
      `source_snapshots?select=id,title,content_text,content_markdown,fetched_at&id=${encodeURIComponent(inFilter(snapshotIds))}`,
    )
    : [];
  const parties = partyIds.length
    ? await database<Party[]>(
      `parties?select=id,name,short_name,ideology,color,emblem_path&id=${encodeURIComponent(inFilter(partyIds))}`,
    )
    : [];

  const changeById = new Map(changes.map((change) => [change.id, change]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const snapshotById = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
  const partyById = new Map(parties.map((party) => [party.id, party]));

  return {
    items: items.map((item) => {
      const change = changeById.get(item.item_id);
      const source = change ? sourceById.get(change.source_id) : undefined;
      return {
        ...item,
        party: item.party_id ? partyById.get(item.party_id) ?? null : null,
        change: change ?? null,
        source: source ?? null,
        before: change?.before_snapshot_id ? snapshotById.get(change.before_snapshot_id) ?? null : null,
        after: change?.after_snapshot_id ? snapshotById.get(change.after_snapshot_id) ?? null : null,
      };
    }),
    counts: {
      pending: items.filter((item) => item.status === "pending").length,
      inReview: items.filter((item) => item.status === "in_review").length,
      urgent: items.filter((item) => item.priority >= 80).length,
    },
  };
}

async function updateReview(request: Request) {
  const body = await request.json() as {
    action?: "start" | "approve" | "reject";
    reviewItemId?: string;
    changeId?: string;
    notes?: string;
  };

  if (!body.reviewItemId || !body.action || !["start", "approve", "reject"].includes(body.action)) {
    return json(request, { error: "Åtgärden eller granskningsposten saknas." }, 400);
  }

  const now = new Date().toISOString();
  const status = body.action === "start" ? "in_review" : body.action === "approve" ? "approved" : "rejected";
  const reviewUpdate = {
    status,
    reviewer: "Sakfrågans redaktion",
    review_notes: body.notes?.trim() || null,
    reviewed_at: body.action === "start" ? null : now,
    updated_at: now,
  };

  await database(
    `review_items?id=eq.${encodeURIComponent(body.reviewItemId)}&status=in.(pending,in_review)`,
    {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify(reviewUpdate),
    },
  );

  if (body.changeId && body.action !== "start") {
    await database(`detected_changes?id=eq.${encodeURIComponent(body.changeId)}&status=eq.pending`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({
        status,
        reviewer: "Sakfrågans redaktion",
        review_notes: body.notes?.trim() || null,
        reviewed_at: now,
        updated_at: now,
      }),
    });
  }

  return json(request, {
    ok: true,
    message: body.action === "approve"
      ? "Ändringen är godkänd för redaktionell bearbetning. Ingen text har publicerats automatiskt."
      : body.action === "reject"
      ? "Ändringen har avvisats."
      : "Granskningen är påbörjad.",
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json(request, { error: "Webbplatsen saknar åtkomst." }, 403);
  }

  if (!(await tokenIsValid(request.headers.get("x-sakfragan-admin") ?? ""))) {
    return json(request, { error: "Granskningsnyckeln är ogiltig." }, 401);
  }

  try {
    if (request.method === "GET") return json(request, await loadQueue());
    if (request.method === "POST") return await updateReview(request);
    return json(request, { error: "Metoden stöds inte." }, 405);
  } catch (error) {
    console.error(error);
    return json(request, { error: "Granskningsflödet kunde inte nå databasen." }, 500);
  }
});
