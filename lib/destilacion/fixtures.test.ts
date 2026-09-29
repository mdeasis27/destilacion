import { describe, expect, it } from "vitest";
import breakEvenFixture from "./fixtures/breakEven.json";
import documents from "./data/documents.json";

import { breakEvenVolume, totalStudentCost, totalTeacherCost } from "./breakeven";
import { fieldAccuracy } from "./metrics";
import { extractInvoice } from "./extract";
import type { InvoiceDocument, InvoiceFields } from "./types";

const COST_MODEL = breakEvenFixture.costModel as {
  gpuMonthlyCost: number;
  tokensPerRequest: number;
  teacherPricePer1k: number;
  studentMarginalPer1k: number;
};

describe("pinned fixture: break-even", () => {
  it("matches the pinned break-even volume", () => {
    expect(breakEvenVolume(COST_MODEL)).toBeCloseTo(breakEvenFixture.breakEven.breakEvenVolume, 6);
  });

  it("matches the pinned total-cost cases", () => {
    for (const c of breakEvenFixture.totalCost) {
      expect(totalTeacherCost(COST_MODEL, c.volume)).toBeCloseTo(c.teacherTotal, 6);
      expect(totalStudentCost(COST_MODEL, c.volume)).toBeCloseTo(c.studentTotal, 6);
    }
  });
});

describe("pinned fixture: field accuracy", () => {
  it("matches the pinned accuracy cases", () => {
    for (const c of breakEvenFixture.fieldAccuracy) {
      const extracted = [c.extracted as InvoiceFields];
      const gold = [c.gold as InvoiceFields];
      expect(fieldAccuracy(extracted, gold).accuracy).toBeCloseTo(c.accuracy, 10);
    }
  });
});

describe("pinned fixture: extractor test-set accuracy", () => {
  it("extracts the untouched test split at the pinned accuracy", () => {
    const docs = documents as unknown as InvoiceDocument[];
    const testDocs = docs.filter((d) => d.split === "test");
    const extracted = testDocs.map((d) => extractInvoice(d.text));
    const gold = testDocs.map((d) => d.gold);
    const result = fieldAccuracy(extracted, gold);
    expect(result.accuracy).toBeCloseTo(breakEvenFixture.expectedTestAccuracy, 10);
  });
});
