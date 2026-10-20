# Agentinstruktioner

## Supabase-migrationer: explicita GRANTs (obligatoriskt)

Från 2026-10-30 får nya tabeller i `public` inga automatiska Data API-rättigheter, även vid `supabase db reset`, preview-branches och nya projekt ([Supabase #45329](https://github.com/orgs/supabase/discussions/45329)). Utan GRANT svarar PostgREST `42501 permission denied`, oavsett RLS.

Varje migration som skapar en tabell i `public` ska i **samma migration** ha:

1. Explicita `GRANT`: `SELECT` till `anon` endast där utloggad läsning behövs; `SELECT, INSERT, UPDATE, DELETE` till `authenticated` och `service_role`, matchat mot RLS-policyerna.
2. `ENABLE ROW LEVEL SECURITY` och policies.
3. `GRANT USAGE, SELECT ON SEQUENCE ...` om tabellen har `serial`/`bigserial` och klienten gör INSERT.

```sql
create table public.exempel (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titel text not null
);

grant select, insert, update, delete on table public.exempel to authenticated, service_role;
-- grant select on table public.exempel to anon;  -- endast om tabellen ska vara publikt läsbar

alter table public.exempel enable row level security;

create policy "exempel_egna_rader" on public.exempel
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Ändra aldrig migrationer som redan körts; lägg till en ny migration i stället.
