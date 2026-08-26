-- Revoke active credentials before deleting the retired Idea Dump users.
-- The cutoff predates Sakfragan and is intentionally fixed for auditability.

delete from auth.refresh_tokens as token
using auth.users as legacy_user
where token.user_id = legacy_user.id::text
  and legacy_user.created_at < timestamptz '2026-08-23 00:00:00+00';

delete from auth.sessions as session
using auth.users as legacy_user
where session.user_id = legacy_user.id
  and legacy_user.created_at < timestamptz '2026-08-23 00:00:00+00';

delete from auth.users
where created_at < timestamptz '2026-08-23 00:00:00+00';
