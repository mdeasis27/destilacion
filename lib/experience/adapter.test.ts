import { describe, expect, it } from "vitest";
import { runExperience } from "./adapter";

describe("destillation experience", () => {
  it("extracts input fields and changes the cost position with volume", async () => {
    const low = await runExperience({ invoiceText: "INV-9\nVendor: Atlas\n2026-01-10\nTotal: $10.00 USD", monthlyVolume: 10_000 });
    const high = await runExperience({ invoiceText: "FACT-22\nVendor: Cedar\n2026-02-11\nTotal: $900.00 EUR", monthlyVolume: 1_000_000 });
    expect(low.result.fields.vendor).toBe("Atlas");
    expect(high.result.fields.vendor).toBe("Cedar");
    expect(low.result.recommendation).not.toBe(high.result.recommendation);
  });
  it("refuses missing input, non-finite volume, and an aborted run", async () => {
    await expect(runExperience({ invoiceText: "", monthlyVolume: 1 })).rejects.toThrow("Invoice");
    await expect(runExperience({ invoiceText: "INV-1", monthlyVolume: Number.NaN })).rejects.toThrow("Monthly");
    const controller = new AbortController(); controller.abort();
    await expect(runExperience({ invoiceText: "INV-1", monthlyVolume: 1 }, controller.signal)).rejects.toThrow("Aborted");
  });
  it("charges whole request batches in integer cents and refuses fractional volume", async () => {
    const one = await runExperience({ invoiceText: "INV-1", monthlyVolume: 1 });
    const thousandOne = await runExperience({ invoiceText: "INV-1", monthlyVolume: 1_001 });
    expect(one.result.teacherCostCents).toBe(1);
    expect(one.result.studentCostCents).toBe(180_000);
    expect(thousandOne.result.teacherCostCents).toBe(601);
    await expect(runExperience({ invoiceText: "INV-1", monthlyVolume: 1.5 })).rejects.toThrow("whole");
    await expect(runExperience({ invoiceText: "INV-1", monthlyVolume: Number.MAX_SAFE_INTEGER })).rejects.toThrow("safe");
  });
  it("stops if an event callback aborts the run", async () => {
    const controller = new AbortController();
    await expect(runExperience({ invoiceText: "INV-1", monthlyVolume: 1 }, controller.signal, () => controller.abort())).rejects.toThrow("Aborted");
  });
});
