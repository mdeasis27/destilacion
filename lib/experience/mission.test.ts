import {expect, test} from "vitest";
import {costDecision} from "./mission";
import {runExperience} from "./adapter";

test("computes the decision from actual cents including exact equality",async()=>{
  for(const [volume,expected] of [[120000,"api"],[300000,"equal"],[1000000,"local"]] as const){
    const run=await runExperience({invoiceText:"INV-1",monthlyVolume:volume});
    expect(costDecision(run.result)).toBe(expected);
    expect(run.result.recommendation).toBe(expected==="local"?"self-host":expected);
    expect(Number.isInteger(run.result.teacherCostCents)).toBe(true);
    expect(Number.isInteger(run.result.studentCostCents)).toBe(true);
  }
});
