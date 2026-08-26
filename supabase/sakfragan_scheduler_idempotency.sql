alter table sakfragan.ingest_runs
  add column if not exists idempotency_key text;

create unique index if not exists ingest_runs_idempotency_key_uq
  on sakfragan.ingest_runs (idempotency_key)
  where idempotency_key is not null;
