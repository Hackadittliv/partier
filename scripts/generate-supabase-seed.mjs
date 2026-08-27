import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../app/data.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const sandbox = { exports: {}, module: { exports: {} } };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(javascript, sandbox);

const { parties, partiesByFounded, topics } = sandbox.module.exports;

if (!Array.isArray(parties) || parties.length === 0) {
  throw new Error("Inga partier hittades i app/data.ts");
}

if (!Array.isArray(topics) || topics.length === 0) {
  throw new Error("Inga sakområden hittades i app/data.ts");
}

const sqlText = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `${sqlText(JSON.stringify(value))}::jsonb`;

const values = (rows) => rows.map((row) => `  (${row.join(", ")})`).join(",\n");

const displayOrderByParty = new Map(partiesByFounded.map((party, index) => [party.id, index + 1]));

const partyRows = parties.map((party) => [
  sqlText(party.id),
  sqlText(party.name),
  sqlText(party.short),
  sqlText(party.group),
  sqlText(party.ideology),
  sqlText(party.color),
  sqlText(party.emblem),
  String(displayOrderByParty.get(party.id)),
]);

const topicRows = topics.map((topic, index) => [
  sqlText(topic.id),
  sqlText(topic.label),
  sqlText(topic.question),
  String(index + 1),
]);

const profileRows = parties.map((party) => [
  sqlText(party.id),
  sqlText(party.overview),
  sqlText(party.status),
  sqlJson(party.priorities),
]);

const positionRows = parties.flatMap((party) =>
  topics.map((topic) => [
    sqlText(party.id),
    sqlText(topic.id),
    sqlText(party.positions[topic.id]),
    sqlText("published"),
  ]),
);

const sourceKind = (title) => {
  const normalized = title.toLocaleLowerCase("sv");
  if (normalized.includes("valmanifest") || normalized.includes("valplattform")) {
    return "manifesto";
  }
  if (normalized.includes("vallöfte")) {
    return "press";
  }
  if (normalized.includes("program")) {
    return "program";
  }
  if (normalized.includes("regering")) {
    return "press";
  }
  return "policy";
};

const sourceRows = parties.flatMap((party) =>
  party.sources.map((source, index) => {
    const kind = sourceKind(source.title);
    const frequency = kind === "manifesto" || kind === "program" ? "weekly" : "daily";
    return [
      sqlText(party.id),
      sqlText(kind),
      sqlText(source.title),
      sqlText(source.url),
      sqlText(frequency),
      String(Math.max(10, 100 - index * 10)),
      sqlJson({
        imported_from: "app/data.ts",
        monitoring_tier: frequency === "daily" ? "dynamic" : "stable",
        ...(source.publishedAt ? { published_at_label: source.publishedAt } : {}),
        ...(source.url.toLowerCase().includes(".pdf") ? { pdf_strategy: "direct_hash" } : {}),
      }),
    ];
  }),
);

const output = `insert into sakfragan.parties (
  id, name, short_name, group_name, ideology, color, emblem_path, display_order
)
values
${values(partyRows)}
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  group_name = excluded.group_name,
  ideology = excluded.ideology,
  color = excluded.color,
  emblem_path = excluded.emblem_path,
  display_order = excluded.display_order;

insert into sakfragan.topics (id, label, question, display_order)
values
${values(topicRows)}
on conflict (id) do update set
  label = excluded.label,
  question = excluded.question,
  display_order = excluded.display_order;

insert into sakfragan.party_profiles (party_id, overview, status_label, priorities)
values
${values(profileRows)}
on conflict (party_id) do update set
  overview = excluded.overview,
  status_label = excluded.status_label,
  priorities = excluded.priorities;

insert into sakfragan.party_positions (party_id, topic_id, summary, publication_status)
values
${values(positionRows)}
on conflict (party_id, topic_id) do update set
  summary = excluded.summary,
  publication_status = excluded.publication_status;

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority, metadata
)
values
${values(sourceRows)}
on conflict (canonical_url) do update set
  party_id = excluded.party_id,
  source_kind = excluded.source_kind,
  title = excluded.title,
  check_frequency = excluded.check_frequency,
  priority = excluded.priority,
  metadata = sakfragan.sources.metadata || excluded.metadata;
`;

process.stdout.write(output);
