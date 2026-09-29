"""Shared types for the extraction + break-even model.

Mirrors lib/destilacion/types.ts.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Split = Literal["train", "val", "test"]


@dataclass
class InvoiceFields:
    invoice_number: str = ""
    date: str = ""
    vendor: str = ""
    total: str = ""
    currency: str = ""

    def as_dict(self) -> dict[str, str]:
        return {
            "invoiceNumber": self.invoice_number,
            "date": self.date,
            "vendor": self.vendor,
            "total": self.total,
            "currency": self.currency,
        }


@dataclass
class InvoiceDocument:
    id: str
    split: Split
    text: str
    gold: InvoiceFields


@dataclass
class CostModel:
    gpu_monthly_cost: float
    tokens_per_request: float
    teacher_price_per_1k: float
    student_marginal_per_1k: float
