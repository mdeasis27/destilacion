"""Self-host vs frontier break-even.

Mirrors lib/destilacion/breakeven.ts. Self-host is a fixed cost, not "cheaper
per token": it wins only above the volume where the fixed GPU bill is smaller
than the API cost of the same tokens.
"""

from __future__ import annotations

import math

from .types import CostModel


def teacher_cost_per_request(model: CostModel) -> float:
    return (model.tokens_per_request / 1000) * model.teacher_price_per_1k


def student_marginal_per_request(model: CostModel) -> float:
    return (model.tokens_per_request / 1000) * model.student_marginal_per_1k


def break_even_volume(model: CostModel) -> float:
    marginal_gap = teacher_cost_per_request(model) - student_marginal_per_request(model)
    if marginal_gap <= 0:
        return math.inf
    return model.gpu_monthly_cost / marginal_gap


def total_teacher_cost(model: CostModel, volume: float) -> float:
    return teacher_cost_per_request(model) * volume


def total_student_cost(model: CostModel, volume: float) -> float:
    return model.gpu_monthly_cost + student_marginal_per_request(model) * volume


def student_cost_per_1k(model: CostModel, volume: float) -> float:
    if volume <= 0:
        return math.inf
    total_tokens = volume * model.tokens_per_request
    return (total_student_cost(model, volume) * 1000) / total_tokens
