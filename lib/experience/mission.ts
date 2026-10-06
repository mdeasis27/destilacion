import type {ExperienceResult} from "./adapter";

export function costDecision(result:Pick<ExperienceResult,"teacherCostCents"|"studentCostCents">):"api"|"local"|"equal" {
  if (result.teacherCostCents === result.studentCostCents) return "equal";
  return result.teacherCostCents < result.studentCostCents ? "api" : "local";
}
