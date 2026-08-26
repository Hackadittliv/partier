update sakfragan.sources
set
  check_frequency = case
    when source_kind in ('manifesto', 'program') then 'weekly'
    when source_kind in ('policy', 'press', 'website') then 'daily'
    else check_frequency
  end,
  next_check_at = case
    when source_kind in ('manifesto', 'program') then now() + interval '7 days'
    when source_kind in ('policy', 'press', 'website') then now() + interval '1 day'
    else next_check_at
  end,
  metadata = metadata || jsonb_build_object(
    'monitoring_tier',
    case
      when source_kind in ('manifesto', 'program') then 'stable'
      when source_kind in ('policy', 'press', 'website') then 'dynamic'
      else 'manual'
    end
  ) || case
    when lower(split_part(canonical_url, '?', 1)) like '%.pdf'
      then jsonb_build_object('pdf_strategy', 'direct_hash')
    else '{}'::jsonb
  end,
  updated_at = now()
where active
  and official
  and source_kind <> 'social';
