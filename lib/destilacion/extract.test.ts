import { describe, expect, it } from "vitest";

import { extractInvoice } from "./extract";
import { fieldAccuracy } from "./metrics";
import type { InvoiceFields } from "./types";

describe("invoice extractor", () => {
  it("extracts all fields from a standard invoice", () => {
    const text = "INV-2024-001\nDate: 2024-01-15\nVendor: Acme Corp\nTotal: $1250.00 USD";
    expect(extractInvoice(text)).toEqual({
      invoiceNumber: "INV-2024-001",
      date: "2024-01-15",
      vendor: "Acme Corp",
      total: "1250.00",
      currency: "USD",
    });
  });

  it("misses a non-ISO date (documented limitation)", () => {
    const text = "FAC-2024-002\nDate: 15/01/2024\nVendor: Globex S.A.\nTotal: $980.50 USD";
    expect(extractInvoice(text).date).toBe("");
  });

  it("misses a vendor without a 'Vendor:' label", () => {
    const text = "INV-2024-003\nDate: 2024-02-20\nACME HOLDINGS LLC\nTotal: $3,210.75 USD";
    expect(extractInvoice(text).vendor).toBe("");
  });

  it("normalises currency case", () => {
    const text = "INV-2024-004\nDate: 2024-03-10\nVendor: Initech\nTotal: $450.00 eur";
    expect(extractInvoice(text).currency).toBe("EUR");
  });
});

describe("field accuracy", () => {
  const gold: InvoiceFields = {
    invoiceNumber: "A-1001",
    date: "2024-01-15",
    vendor: "Acme",
    total: "1250.00",
    currency: "USD",
  };

  it("scores a perfect extraction 1.0", () => {
    const result = fieldAccuracy([{ ...gold }], [gold]);
    expect(result.accuracy).toBe(1);
    expect(result.correct).toBe(5);
  });

  it("scores one miss as 0.8", () => {
    const result = fieldAccuracy([{ ...gold, date: "" }], [gold]);
    expect(result.accuracy).toBeCloseTo(0.8, 10);
    expect(result.byField.date.correct).toBe(0);
  });

  it("requires equal lengths", () => {
    expect(() => fieldAccuracy([gold], [])).toThrow();
  });
});
