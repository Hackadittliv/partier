with baselines(canonical_url, hash, bytes) as (
  values
    (
      'https://val2026.centerpartiet.se/wp-content/uploads/2026/06/Valmanifest-2026.pdf',
      '69013e13c1abd35bdfc5cde0dfa3201ab5b4f25cc171141e0932e57d63af8892',
      2619329
    ),
    (
      'https://kristdemokraterna.se/download/18.3fb0a02c1a01f5f28f7326/1787292489599/Valmanifest%202026.pdf',
      '6aafa90124dc4a694d278a0446b7532b53e84cca007bcd80de50f78ebacc4630',
      2498235
    ),
    (
      'https://www.liberalerna.se/wp-content/uploads/liberalernas-valmanifest-2026-40s-komprimerad.pdf',
      'c37b7163ca017aa73a14861f3a66298b89fced7e7d5939aa3d697510ddf8cd31',
      699812
    ),
    (
      'https://moderaterna.se/app/uploads/2025/10/Stammohandlingar2025_6oktober.pdf',
      'a507ce4728224f16092a43791e3ea25bcb893a3d8376de5cba0e552bae307979',
      3361928
    ),
    (
      'https://www.sd.se/wp-content/uploads/2026/07/valplattform-2026.pdf',
      'fa1bdfe015b73de1be3182dec78b7ec498e9822d3a4b4f89ae3ee1b679bb1407',
      150872
    )
)
update sakfragan.sources as source
set
  metadata = source.metadata || jsonb_build_object(
    'pdf_binary_hash', baselines.hash,
    'pdf_bytes', baselines.bytes,
    'pdf_baseline_at', now(),
    'pdf_strategy', 'direct_hash'
  ),
  updated_at = now()
from baselines
where source.canonical_url = baselines.canonical_url;
