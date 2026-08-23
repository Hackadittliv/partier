const SCHEMA = "sakfragan";

export class MissingEnvironmentVariableError extends Error {
  constructor(name: string) {
    super(`Miljövariabeln ${name} saknas.`);
    this.name = "MissingEnvironmentVariableError";
  }
}

function requiredEnvironmentVariable(name: string) {
  const value = Netlify.env.get(name)?.trim();

  if (!value) {
    throw new MissingEnvironmentVariableError(name);
  }

  return value;
}

type SupabaseRequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  prefer?: string;
};

export async function supabaseRequest<T>(
  resource: string,
  options: SupabaseRequestOptions = {},
): Promise<T> {
  const supabaseUrl = requiredEnvironmentVariable("SUPABASE_URL");
  const serviceRoleKey = requiredEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");
  const url = new URL(`/rest/v1/${resource}`, supabaseUrl);
  const method = options.method ?? "GET";

  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Accept-Profile": SCHEMA,
      "Content-Profile": SCHEMA,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Supabase svarade med ${response.status} för ${method} ${resource}: ${responseText.slice(0, 500)}`,
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

export function postgrestQuery(parameters: Record<string, string>) {
  return new URLSearchParams(parameters).toString();
}
