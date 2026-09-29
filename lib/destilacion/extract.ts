// lib/destilacion/extract.ts
// Deterministic rule-based invoice extractor — the "student" proxy in demo
// mode. It is NOT a neural LoRA: it stands in for one so the comparison runs
// offline with zero keys. The interface is the same a real LoRA extractor
// would implement, and its (real) accuracy is what the demo measures.
//
// The rules were written against the train/val split; the test split is only
// used for the final measurement (see LABELING.md).

import type { Extractor, InvoiceFields } from "./types";

const INVOICE_NUMBER = /(?:INV|FACT|FAC)[-: ]?[A-Z0-9-]+/i;
const ISO_DATE = /(\d{4}-\d{2}-\d{2})/;
const VENDOR = /vendor:\s*(.+)/i;
const TOTAL = /total:?\s*\$?([\d,]+\.\d{2})/i;
const CURRENCY = /\b(USD|EUR|MXN|GBP)\b/i;

function firstMatch(re: RegExp, text: string): string {
  const m = text.match(re);
  return m ? m[1] : "";
}

export const extractInvoice: Extractor = (text: string): InvoiceFields => {
  const invoiceNumberMatch = text.match(INVOICE_NUMBER);
  const currencyMatch = text.match(CURRENCY);

  return {
    invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[0] : "",
    date: firstMatch(ISO_DATE, text),
    vendor: firstMatch(VENDOR, text).trim(),
    total: firstMatch(TOTAL, text),
    currency: currencyMatch ? currencyMatch[0].toUpperCase() : "",
  };
};
