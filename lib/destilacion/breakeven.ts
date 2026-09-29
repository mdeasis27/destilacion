// lib/destilacion/breakeven.ts
// Self-host vs frontier break-even. The insight: self-host is NOT "cheaper per
// token" — it's a fixed cost. It only wins above the volume where the fixed GPU
// bill is smaller than what the API would charge for the same tokens.

import type { BreakEvenResult, CostModel } from "./types";

export function teacherCostPerRequest(model: CostModel): number {
  return (model.tokensPerRequest / 1000) * model.teacherPricePer1k;
}

export function studentMarginalPerRequest(model: CostModel): number {
  return (model.tokensPerRequest / 1000) * model.studentMarginalPer1k;
}

export function breakEvenVolume(model: CostModel): number {
  const marginalGap = teacherCostPerRequest(model) - studentMarginalPerRequest(model);
  if (marginalGap <= 0) {
    // Self-host is never cheaper if its marginal cost meets the teacher's price.
    return Number.POSITIVE_INFINITY;
  }
  return model.gpuMonthlyCost / marginalGap;
}

export function totalTeacherCost(model: CostModel, volume: number): number {
  return teacherCostPerRequest(model) * volume;
}

export function totalStudentCost(model: CostModel, volume: number): number {
  return model.gpuMonthlyCost + studentMarginalPerRequest(model) * volume;
}

/** Amortized self-host cost per 1k tokens at a given monthly volume. */
export function studentCostPer1k(model: CostModel, volume: number): number {
  if (volume <= 0) return Number.POSITIVE_INFINITY;
  const totalTokens = volume * model.tokensPerRequest;
  return (totalStudentCost(model, volume) * 1000) / totalTokens;
}

export function buildBreakEven(model: CostModel): BreakEvenResult {
  return {
    breakEvenVolume: breakEvenVolume(model),
    teacherCostPerRequest: teacherCostPerRequest(model),
    studentMarginalPerRequest: studentMarginalPerRequest(model),
    studentCostPer1k: (volume: number) => studentCostPer1k(model, volume),
  };
}

/** Relative cost of self-host vs teacher at a given volume (<1 means cheaper). */
export function selfHostSavingsRatio(model: CostModel, volume: number): number {
  const teacher = totalTeacherCost(model, volume);
  if (teacher <= 0) return 1;
  return totalStudentCost(model, volume) / teacher;
}
