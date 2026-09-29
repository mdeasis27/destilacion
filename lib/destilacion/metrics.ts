// lib/destilacion/metrics.ts
// Field exact-match accuracy — the correctness signal for a strict-schema
// extraction task. A field is correct only if the extracted value equals the
// gold value exactly (no partial credit, no fuzzy match).

import type { AccuracyResult, FieldKey, InvoiceFields } from "./types";

export const FIELD_KEYS: FieldKey[] = [
  "invoiceNumber",
  "date",
  "vendor",
  "total",
  "currency",
];

export function fieldAccuracy(
  extracted: readonly InvoiceFields[],
  gold: readonly InvoiceFields[],
): AccuracyResult {
  if (extracted.length !== gold.length) {
    throw new Error("fieldAccuracy: extracted and gold must have equal length");
  }

  const byField = {} as Record<FieldKey, { correct: number; total: number; accuracy: number }>;
  for (const key of FIELD_KEYS) {
    byField[key] = { correct: 0, total: 0, accuracy: 0 };
  }

  let correct = 0;
  let total = 0;

  for (let i = 0; i < gold.length; i += 1) {
    for (const key of FIELD_KEYS) {
      total += 1;
      byField[key].total += 1;
      if (normalise(extracted[i][key]) === normalise(gold[i][key])) {
        correct += 1;
        byField[key].correct += 1;
      }
    }
  }

  for (const key of FIELD_KEYS) {
    byField[key].accuracy = byField[key].total === 0 ? 0 : byField[key].correct / byField[key].total;
  }

  return {
    correct,
    total,
    accuracy: total === 0 ? 0 : correct / total,
    byField,
  };
}

export function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
