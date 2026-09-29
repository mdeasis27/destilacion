import json
from pathlib import Path

import pytest

from destilacion.breakeven import (
    break_even_volume,
    total_student_cost,
    total_teacher_cost,
)
from destilacion.extract import extract_invoice
from destilacion.metrics import field_accuracy
from destilacion.types import CostModel, InvoiceFields

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def _fields(obj: dict) -> InvoiceFields:
    return InvoiceFields(
        invoice_number=obj["invoiceNumber"],
        date=obj["date"],
        vendor=obj["vendor"],
        total=obj["total"],
        currency=obj["currency"],
    )


def _cost_model() -> CostModel:
    cm = _load("breakEven.json")["costModel"]
    return CostModel(
        gpu_monthly_cost=cm["gpuMonthlyCost"],
        tokens_per_request=cm["tokensPerRequest"],
        teacher_price_per_1k=cm["teacherPricePer1k"],
        student_marginal_per_1k=cm["studentMarginalPer1k"],
    )


def test_break_even_volume_matches_fixture():
    fixture = _load("breakEven.json")
    model = _cost_model()
    assert break_even_volume(model) == pytest.approx(fixture["breakEven"]["breakEvenVolume"], abs=1e-6)


def test_total_cost_matches_fixture():
    fixture = _load("breakEven.json")
    model = _cost_model()
    for case in fixture["totalCost"]:
        assert total_teacher_cost(model, case["volume"]) == pytest.approx(case["teacherTotal"], abs=1e-6)
        assert total_student_cost(model, case["volume"]) == pytest.approx(case["studentTotal"], abs=1e-6)


def test_field_accuracy_matches_fixture():
    fixture = _load("breakEven.json")
    for case in fixture["fieldAccuracy"]:
        extracted = [_fields(case["extracted"])]
        gold = [_fields(case["gold"])]
        assert field_accuracy(extracted, gold).accuracy == pytest.approx(case["accuracy"], abs=1e-9)


def test_extractor_test_set_accuracy_matches_fixture():
    fixture = _load("breakEven.json")
    documents = _load("documents.json")
    test_docs = [d for d in documents if d["split"] == "test"]
    extracted = [extract_invoice(d["text"]) for d in test_docs]
    gold = [_fields(d["gold"]) for d in test_docs]
    result = field_accuracy(extracted, gold)
    assert result.accuracy == pytest.approx(fixture["expectedTestAccuracy"], abs=1e-9)
