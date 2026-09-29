import { describe, expect, it } from "vitest";

import {
  breakEvenVolume,
  studentCostPer1k,
  teacherCostPerRequest,
  totalStudentCost,
  totalTeacherCost,
} from "./breakeven";
import type { CostModel } from "./types";

const MODEL: CostModel = {
  gpuMonthlyCost: 1_800,
  tokensPerRequest: 1_000,
  teacherPricePer1k: 0.006,
  studentMarginalPer1k: 0,
};

describe("break-even", () => {
  it("computes the teacher per-request cost", () => {
    expect(teacherCostPerRequest(MODEL)).toBeCloseTo(0.006, 10);
  });

  it("computes the break-even volume", () => {
    expect(breakEvenVolume(MODEL)).toBeCloseTo(300_000, 6);
  });

  it("self-host is fixed cost (flat with volume)", () => {
    expect(totalStudentCost(MODEL, 100_000)).toBe(1_800);
    expect(totalStudentCost(MODEL, 1_000_000)).toBe(1_800);
  });

  it("teacher cost grows linearly with volume", () => {
    expect(totalTeacherCost(MODEL, 300_000)).toBeCloseTo(1_800, 6);
    expect(totalTeacherCost(MODEL, 600_000)).toBeCloseTo(3_600, 6);
  });

  it("student cost per 1k equals teacher price at break-even", () => {
    const atBreakEven = studentCostPer1k(MODEL, 300_000);
    expect(atBreakEven).toBeCloseTo(MODEL.teacherPricePer1k, 6);
  });

  it("returns infinity when self-host can never win", () => {
    const model: CostModel = { ...MODEL, studentMarginalPer1k: 0.006 };
    expect(breakEvenVolume(model)).toBe(Number.POSITIVE_INFINITY);
  });
});
