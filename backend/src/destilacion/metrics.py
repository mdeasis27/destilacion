"""Field exact-match accuracy.

Mirrors lib/destilacion/metrics.ts. A field is correct only if the extracted
value equals the gold value exactly (after trim/lowercase/whitespace collapse).
"""

from __future__ import annotations

from dataclasses import dataclass

from .types import InvoiceFields

FIELD_KEYS = ("invoice_number", "date", "vendor", "total", "currency")


@dataclass
class FieldStat:
    correct: int = 0
    total: int = 0

    @property
    def accuracy(self) -> float:
        return self.correct / self.total if self.total else 0.0


@dataclass
class AccuracyResult:
    correct: int
    total: int
    by_field: dict[str, FieldStat]

    @property
    def accuracy(self) -> float:
        return self.correct / self.total if self.total else 0.0


def _normalise(value: str) -> str:
    return " ".join(value.strip().lower().split())


def field_accuracy(extracted: list[InvoiceFields], gold: list[InvoiceFields]) -> AccuracyResult:
    if len(extracted) != len(gold):
        raise ValueError("field_accuracy: extracted and gold must have equal length")

    by_field = {key: FieldStat() for key in FIELD_KEYS}
    correct = 0
    total = 0

    for ex, gd in zip(extracted, gold):
        for key in FIELD_KEYS:
            total += 1
            by_field[key].total += 1
            if _normalise(getattr(ex, key)) == _normalise(getattr(gd, key)):
                correct += 1
                by_field[key].correct += 1

    return AccuracyResult(correct=correct, total=total, by_field=by_field)
