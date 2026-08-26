-- Retire the unused Idea Dump / Net Worth application without touching the
-- active Sakfragan schema. Legacy business data is retained in a private,
-- non-API schema so the cleanup remains recoverable.

create schema if not exists idea_dump_archive;

comment on schema idea_dump_archive is
  'Private archive of the retired Idea Dump / Net Worth application. No API roles have access.';

revoke all on schema idea_dump_archive from public, anon, authenticated, service_role;

-- Keep only the minimum identity inventory needed to understand the archive.
-- Password hashes, refresh tokens, sessions and OAuth data are deliberately
-- excluded.
create table idea_dump_archive.auth_user_inventory as
select
  id,
  email,
  created_at,
  last_sign_in_at,
  confirmed_at,
  raw_app_meta_data ->> 'provider' as provider
from auth.users
where created_at < timestamptz '2026-08-23 00:00:00+00';

alter table idea_dump_archive.auth_user_inventory
  add primary key (id);

alter table idea_dump_archive.auth_user_inventory enable row level security;

-- These triggers belong to the retired frontend and must not run for future
-- auth users in this shared project.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_subscriber on auth.users;

-- Move all legacy application data out of the API-exposed public schema.
alter table public.organizations set schema idea_dump_archive;
alter table public.assets set schema idea_dump_archive;
alter table public.liabilities set schema idea_dump_archive;
alter table public.net_worth_logs set schema idea_dump_archive;
alter table public.goals set schema idea_dump_archive;
alter table public.summaries set schema idea_dump_archive;
alter table public.organization_members set schema idea_dump_archive;
alter table public.ai_help_cache set schema idea_dump_archive;
alter table public.profiles set schema idea_dump_archive;
alter table public.loan_transactions set schema idea_dump_archive;
alter table public.ai_insights_history set schema idea_dump_archive;
alter table public.activities set schema idea_dump_archive;
alter table public.subscribers set schema idea_dump_archive;
alter table public.referrals set schema idea_dump_archive;
alter table public.ai_help_usage set schema idea_dump_archive;
alter table public.email_preferences set schema idea_dump_archive;
alter table public.email_consent_events set schema idea_dump_archive;
alter table public.email_unsubscribe_tokens set schema idea_dump_archive;
alter table public.email_sends set schema idea_dump_archive;
alter table public.security_events set schema idea_dump_archive;
alter table public.client_logs set schema idea_dump_archive;
alter table public.sensitive_data_audit set schema idea_dump_archive;
alter table public.user_roles set schema idea_dump_archive;
alter table public.special_access_users set schema idea_dump_archive;

-- Detach archived rows from auth.users before the legacy identities are
-- removed by the follow-up migration.
alter table idea_dump_archive.ai_help_cache
  drop constraint if exists ai_help_cache_user_id_fkey;
alter table idea_dump_archive.assets
  drop constraint if exists assets_user_id_fkey;
alter table idea_dump_archive.goals
  drop constraint if exists goals_user_id_fkey;
alter table idea_dump_archive.liabilities
  drop constraint if exists liabilities_user_id_fkey;
alter table idea_dump_archive.net_worth_logs
  drop constraint if exists net_worth_logs_user_id_fkey;
alter table idea_dump_archive.organization_members
  drop constraint if exists organization_members_user_id_fkey;
alter table idea_dump_archive.organizations
  drop constraint if exists organizations_user_id_fkey;
alter table idea_dump_archive.profiles
  drop constraint if exists profiles_id_fkey;
alter table idea_dump_archive.referrals
  drop constraint if exists referrals_invitee_user_id_fkey;
alter table idea_dump_archive.referrals
  drop constraint if exists referrals_inviter_user_id_fkey;
alter table idea_dump_archive.sensitive_data_audit
  drop constraint if exists sensitive_data_audit_accessed_by_fkey;
alter table idea_dump_archive.special_access_users
  drop constraint if exists special_access_users_user_id_fkey;
alter table idea_dump_archive.subscribers
  drop constraint if exists subscribers_user_id_fkey;
alter table idea_dump_archive.summaries
  drop constraint if exists summaries_user_id_fkey;
alter table idea_dump_archive.user_roles
  drop constraint if exists user_roles_user_id_fkey;

-- Remove executable legacy logic. CASCADE is intentional here: it removes
-- only triggers depending on these explicitly named retired functions.
drop function if exists public.check_email_access_patterns() cascade;
drop function if exists public.cleanup_expired_ai_cache() cascade;
drop function if exists public.cleanup_old_security_events() cascade;
drop function if exists public.decrypt_stripe_customer_id(text) cascade;
drop function if exists public.detect_suspicious_ai_patterns() cascade;
drop function if exists public.detect_suspicious_service_access() cascade;
drop function if exists public.encrypt_stripe_customer_id(text) cascade;
drop function if exists public.get_current_user_email() cascade;
drop function if exists public.handle_new_user_subscriber() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.has_role(uuid, public.app_role) cascade;
drop function if exists public.increment_ai_usage(uuid, text) cascade;
drop function if exists public.log_ai_cache_deletion() cascade;
drop function if exists public.log_enhanced_security_event(text, uuid, jsonb, text) cascade;
drop function if exists public.log_role_check() cascade;
drop function if exists public.migrate_stripe_ids_to_encrypted() cascade;
drop function if exists public.monitor_ai_usage_trigger() cascade;
drop function if exists public.monitor_service_access() cascade;
drop function if exists public.prevent_is_pro_escalation() cascade;
drop function if exists public.secure_get_email_preferences(uuid) cascade;
drop function if exists public.secure_get_user_subscribers(uuid) cascade;
drop function if exists public.service_check_email_preferences(text, text) cascade;
drop function if exists public.service_check_subscription(uuid) cascade;
drop function if exists public.service_get_subscriber_by_email(text) cascade;
drop function if exists public.service_update_email_preferences(uuid, boolean, boolean, boolean, boolean) cascade;
drop function if exists public.service_update_subscription_status(uuid, boolean, text, timestamptz, text) cascade;
drop function if exists public.set_ai_cache_expiry() cascade;
drop function if exists public.set_email_from_jwt() cascade;
drop function if exists public.update_updated_at_column() cascade;
drop function if exists public.validate_and_audit_email_operation() cascade;
drop function if exists public.validate_email_matches_jwt() cascade;
drop function if exists public.validate_financial_data() cascade;

alter type public.app_role set schema idea_dump_archive;

-- Defence in depth: the archive is inaccessible even to normal application
-- roles and is not part of the schemas exposed by PostgREST.
revoke all on all tables in schema idea_dump_archive
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema idea_dump_archive
  from public, anon, authenticated, service_role;
revoke all on all functions in schema idea_dump_archive
  from public, anon, authenticated, service_role;
revoke all on schema idea_dump_archive
  from public, anon, authenticated, service_role;
