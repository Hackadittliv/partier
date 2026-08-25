import { timingSafeEqual } from "node:crypto";

export function authorizedConnieWebhook(request: Request, expectedSecret: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const supplied = Buffer.from(suppliedSecret);
  const expected = Buffer.from(expectedSecret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
