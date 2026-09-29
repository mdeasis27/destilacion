"""Deterministic rule-based invoice extractor (the "student" proxy in demo mode).

Mirrors lib/destilacion/extract.ts. Not a neural LoRA: it stands in for one so
the comparison runs offline with zero keys. Its (real) accuracy is what the demo
measures.
"""

from __future__ import annotations

import re

from .types import InvoiceFields

INVOICE_NUMBER = re.compile(r"(?:INV|FACT|FAC)[-: ]?[A-Z0-9-]+", re.IGNORECASE)
ISO_DATE = re.compile(r"(\d{4}-\d{2}-\d{2})")
VENDOR = re.compile(r"vendor:\s*(.+)", re.IGNORECASE)
TOTAL = re.compile(r"total:?\s*\$?([\d,]+\.\d{2})", re.IGNORECASE)
CURRENCY = re.compile(r"\b(USD|EUR|MXN|GBP)\b", re.IGNORECASE)


def _first_match(pattern: re.Pattern, text: str) -> str:
    m = pattern.search(text)
    return m.group(1) if m else ""


def extract_invoice(text: str) -> InvoiceFields:
    invoice_number_match = INVOICE_NUMBER.search(text)
    currency_match = CURRENCY.search(text)
    return InvoiceFields(
        invoice_number=invoice_number_match.group(0) if invoice_number_match else "",
        date=_first_match(ISO_DATE, text),
        vendor=_first_match(VENDOR, text).strip(),
        total=_first_match(TOTAL, text),
        currency=currency_match.group(0).upper() if currency_match else "",
    )
