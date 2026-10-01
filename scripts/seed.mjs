// scripts/seed.mjs
// Creates the destilacion schema + tables and seeds realistic data.
// Run: node scripts/seed.mjs  (requires DATABASE_URL in env or .env.local)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

const EXTRACTIONS = [
  ["INV-2023-014", "Suministros Andinos S.A.", "2,340.50", "USD"],
  ["FACT-2024-011", "Importadora Costa Azul", "2,980.00", "USD"],
  ["INV-2024-001", "Acme Corp", "1250.00", "USD"],
  ["INV-2024-004", "Initech", "450.00", "EUR"],
];

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS destilacion`;
  await sql`DROP TABLE IF EXISTS destilacion.extractions`;

  await sql`
    CREATE TABLE destilacion.extractions (
      id serial PRIMARY KEY,
      invoice_number text NOT NULL,
      vendor text NOT NULL,
      total text NOT NULL,
      currency text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  for (const [invoiceNumber, vendor, total, currency] of EXTRACTIONS) {
    await sql`INSERT INTO destilacion.extractions (invoice_number, vendor, total, currency) VALUES (${invoiceNumber}, ${vendor}, ${total}, ${currency})`;
  }

  const [{ e }] = await sql`SELECT count(*)::int AS e FROM destilacion.extractions`;
  console.log(`Seeded destilacion schema: ${e} extractions`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
