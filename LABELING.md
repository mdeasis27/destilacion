# Labeling & split

Destilación measures a **strict-schema extraction** task (invoice fields). This
documents how the data is labeled and split, and what "correct" means.

## Task schema

Each invoice is extracted into 5 fields, all strings:

| Field | Example | Notes |
|---|---|---|
| `invoiceNumber` | `INV-2024-001` | Alphanumeric identifier. |
| `date` | `2024-01-15` | The issue date, as it appears. |
| `vendor` | `Acme Corp` | The issuer name. |
| `total` | `1250.00` | The invoice total, as a decimal string. |
| `currency` | `USD` | 3-letter code, uppercased. |

## What counts as correct

A field is correct **iff the extracted value equals the gold value exactly**,
after trimming whitespace, lowercasing and collapsing internal whitespace.
No partial credit, no fuzzy match, no character-level edit distance. This is
what makes the task validatable by construction — the metric is not a judge.

## Labeling protocol

1. Each raw invoice `text` was produced from a synthetic but realistic template.
2. `gold` was transcribed field-by-field by hand from the text (single labeler).
3. Because the fields are factual and unambiguous, a single labeler is enough;
   the ceiling is effectively 100% human agreement on these five fields.

## Split

| Split | Docs | Purpose |
|---|---|---|
| `train` | 6 | Used to write the extraction rules. |
| `val` | 3 | Used to sanity-check the rules during development. |
| `test` | 4 | **Untouched** — only used for the final measurement. |

The "student" in demo mode is a rule-based extractor, so "training" is really
"writing the regexes against train/val". The test split is never consulted while
writing rules; it is only read at measurement time (both in `lib/destilacion/demo.ts`
and in the pinned fixture test). This mirrors the discipline a real LoRA
fine-tuning run requires, even though no gradient ever touches these documents.

## Reproducibility

Both the TypeScript and Python implementations read the same committed dataset
and must agree on the test-set accuracy (`0.90`), pinned in
`fixtures/breakEven.json` (`expectedTestAccuracy`). A divergence fails the test
suite in either language.
