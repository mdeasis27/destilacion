// lib/destilacion/demo.ts
// The computed demo layer. Everything the dashboard shows is produced here:
// the student's field accuracy is measured by actually running the extractor
// over the untouched test split; the teacher's quality/latency are documented
// constants (a frontier model can't run offline); the break-even is computed
// from the cost model.

import type { CostModel, InvoiceDocument, LatencyModel } from "./types";
import { extractInvoice } from "./extract";
import { fieldAccuracy } from "./metrics";
import {
  breakEvenVolume,
  studentCostPer1k,
  teacherCostPerRequest,
  totalStudentCost,
  totalTeacherCost,
} from "./breakeven";

import documents from "./data/documents.json";

export const COST_MODEL: CostModel = {
  gpuMonthlyCost: 1_800,
  tokensPerRequest: 1_000,
  teacherPricePer1k: 0.006,
  studentMarginalPer1k: 0,
};

export const LATENCY_MODEL: LatencyModel = {
  teacherP95Ms: 1_800,
  studentP95Ms: 45,
};

/** Documented proxy: a frontier teacher reaches ~97.5% field accuracy on clean
 * invoices; the exact value is precomputed because it cannot run offline. */
export const TEACHER_ACCURACY = 0.975;

const DOCS = documents as readonly InvoiceDocument[];

function splitDocs(split: InvoiceDocument["split"]): InvoiceDocument[] {
  return DOCS.filter((d) => d.split === split);
}

export function getStudentAccuracy() {
  const testDocs = splitDocs("test");
  const extracted = testDocs.map((d) => extractInvoice(d.text));
  const gold = testDocs.map((d) => d.gold);
  return fieldAccuracy(extracted, gold);
}

export function getSplitCounts(): Record<InvoiceDocument["split"], number> {
  return {
    train: splitDocs("train").length,
    val: splitDocs("val").length,
    test: splitDocs("test").length,
  };
}

export type CostPoint = {
  volume: number;
  teacher: number;
  student: number;
};

export function getBreakEvenSeries(volumes: number[]): CostPoint[] {
  return volumes.map((volume) => ({
    volume,
    teacher: totalTeacherCost(COST_MODEL, volume),
    student: totalStudentCost(COST_MODEL, volume),
  }));
}

export function getComparison() {
  const accuracy = getStudentAccuracy();
  const be = breakEvenVolume(COST_MODEL);
  const teacherPerReq = teacherCostPerRequest(COST_MODEL);

  return {
    quality: {
      studentAccuracy: accuracy.accuracy,
      teacherAccuracy: TEACHER_ACCURACY,
      deltaPp: (TEACHER_ACCURACY - accuracy.accuracy) * 100,
    },
    cost: {
      teacherPer1k: COST_MODEL.teacherPricePer1k,
      studentMarginalPer1k: COST_MODEL.studentMarginalPer1k,
      gpuMonthlyCost: COST_MODEL.gpuMonthlyCost,
      teacherPerRequest: teacherPerReq,
      breakEvenVolume: be,
      costPer1kAtBreakEven: studentCostPer1k(COST_MODEL, be),
    },
    latency: {
      teacherP95Ms: LATENCY_MODEL.teacherP95Ms,
      studentP95Ms: LATENCY_MODEL.studentP95Ms,
      speedup: LATENCY_MODEL.teacherP95Ms / LATENCY_MODEL.studentP95Ms,
    },
    byField: accuracy.byField,
    splitCounts: getSplitCounts(),
    series: getBreakEvenSeries([50_000, 150_000, 300_000, 500_000, 1_000_000]),
  };
}
