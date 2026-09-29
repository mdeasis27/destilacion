// lib/destilacion/types.ts
// Core types for Destilación — LoRA fine-tuning vs frontier teacher on a
// strict-schema extraction task, with a self-host break-even model.

export type Split = "train" | "val" | "test";

export type InvoiceFields = {
  invoiceNumber: string;
  date: string;
  vendor: string;
  total: string;
  currency: string;
};

export type FieldKey = keyof InvoiceFields;

export type InvoiceDocument = {
  id: string;
  split: Split;
  text: string;
  gold: InvoiceFields;
};

export type Extractor = (text: string) => InvoiceFields;

export type AccuracyResult = {
  correct: number;
  total: number;
  accuracy: number;
  byField: Record<FieldKey, { correct: number; total: number; accuracy: number }>;
};

export type CostModel = {
  /** Fixed self-host infrastructure cost (USD / month). */
  gpuMonthlyCost: number;
  /** Average tokens per request (input + output). */
  tokensPerRequest: number;
  /** Frontier API price (USD per 1k tokens). */
  teacherPricePer1k: number;
  /** Self-host marginal cost (USD per 1k tokens) — electricity/ops. */
  studentMarginalPer1k: number;
};

export type BreakEvenResult = {
  /** Monthly request volume where self-host total cost equals teacher cost. */
  breakEvenVolume: number;
  teacherCostPerRequest: number;
  studentMarginalPerRequest: number;
  /** Amortized student cost per 1k tokens at a given volume. */
  studentCostPer1k: (volume: number) => number;
};

export type LatencyModel = {
  teacherP95Ms: number;
  studentP95Ms: number;
};

export type QualityModel = {
  teacherAccuracy: number;
  studentAccuracy: number;
};
