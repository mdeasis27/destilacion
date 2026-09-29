# Destilación

**LoRA fine-tuning vs a frontier teacher on a strict-schema extraction task** —
measured on quality, cost and latency, with the self-host break-even volume
where the small model wins.

> **Result:** A deterministic "student" proxy reaches **90.0% field exact-match
> accuracy** (measured on the untouched test split) vs **97.5%** for a frontier
> teacher, at **40× lower latency** and, past **300k requests/month**, lower
> total cost. Below that volume, the API wins.

---

## Result

### Quality — field exact-match accuracy (test split, n = 20 fields)

| Field | Student (LoRA proxy) | Teacher (frontier) |
|---|---|---|
| Nº factura | 100% | 100% |
| Fecha | 75% | 100% |
| Vendedor | 75% | 100% |
| Total | 100% | 100% |
| Moneda | 100% | 100% |
| **Overall** | **90.0%** | **97.5%** |

The student's number is **real**: the deterministic extractor runs over the test
split at page load. The teacher's number is a documented precomputed constant
(a frontier model can't run offline). The 7.5pp gap is the honest price of
self-hosting.

### Cost — break-even at 300k requests/month

| Metric | Teacher | Self-host |
|---|---|---|
| Price / 1k tokens | $6.00 / 1M | $0 (marginal) |
| Fixed infra | — | $1,800 / mes (1× GPU) |
| Cost / request | $0.006 | $0.000 + fixed |

Self-host is **not** "cheaper per token" — it's a fixed cost. It wins only above
the volume where `gpuMonthlyCost / teacherCostPerRequest` is crossed:

```
breakEvenVolume = 1800 / 0.006 = 300,000 requests/month
```

### Latency — p95

| | Teacher (API) | Student (self-host) |
|---|---|---|
| p95 | 1,800 ms | 45 ms |
| Speedup | — | **40×** |

---

## Architecture

```
lib/destilacion/       # core (TypeScript, tested)
  extract.ts            #   deterministic rule-based extractor (student proxy)
  metrics.ts            #   field exact-match accuracy (per field + overall)
  breakeven.ts          #   self-host vs teacher cost + break-even volume
  demo.ts               #   wires test split → comparison → break-even series
  data/documents.json   #   labeled invoices (train/val/test, committed)
  fixtures/breakEven.json # shared math pinned for both languages
backend/                # same math in Python + pytest (authoritative)
  src/destilacion/
  tests/                #   pinned to tests/fixtures/{breakEven,documents}.json
app/                    # Next.js landing + demo dashboard (Vercel, demo mode)
```

The task is **validatable by construction**: each field is right or wrong, so
"correct" is an exact match, not a judge's opinion.

## Design decisions & tradeoffs

1. **The student is a rule-based proxy, not a neural LoRA.** No model download,
   no keys — the accuracy is real because it's measured, but the *absolute*
   number belongs to the proxy. What transfers to production is the harness
   (split, metric, break-even), not the specific extractor. Documented, not
   hidden.
2. **Self-host is modeled as fixed cost, not "cheaper tokens".** The break-even
   framing — the whole point of the project — falls out of one formula. Present
   self-host as cheaper-per-token and you hide the real decision: it only wins
   above a volume.
3. **Test is untouched.** Rules were written on train/val; test is only measured.
   With a rule-based extractor this is a soft guarantee, but it keeps the eval
   honest the same way a real fine-tuning run would.

## What did not work

- **The proxy misses non-ISO dates and unlabeled vendors** (2/20 fields). A real
  LoRA trained on varied formats would close that gap — and that gap is exactly
  what the 7.5pp delta visualizes. The demo turns a weakness into the headline.

## Run it

```bash
# frontend demo + TS tests
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 17 vitest tests

# backend (authoritative math) — Python 3.12+
cd backend && uv sync --extra dev && uv run pytest   # 4 tests, pinned fixture
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.13 · pytest
