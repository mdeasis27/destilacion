import {expect, test} from "vitest";
import {costDecision, monthDays, runMission} from "./mission";
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

const tally=(volume:number)=>{const d=monthDays(volume);return {served:d.filter(x=>x==="served").length,rerouted:d.filter(x=>x==="rerouted").length,lost:d.filter(x=>x==="lost").length};};

test("at 250,000 a month renting stays under the purchase price all 30 days",()=>{
  expect(tally(250000)).toEqual({served:30,rerouted:0,lost:0});
});

test("300,000 is a tie, so renting never goes over; 310,000 crosses on the last day; 1,000,000 crosses on day 10",()=>{
  expect(tally(300000)).toEqual({served:30,rerouted:0,lost:0});
  expect(tally(310000)).toEqual({served:29,rerouted:1,lost:0});
  expect(tally(1000000)).toEqual({served:9,rerouted:1,lost:20});
});

test("sweep: both bet answers are reachable on the slider, and the default says no",async()=>{
  const answers=new Set<boolean>();
  for(let v=10000;v<=1000000;v+=10000){const r=(await runMission({monthlyVolume:v},new AbortController().signal,()=>{})).result;answers.add(r.buyIsCheaper);expect(r.buyIsCheaper).toBe(tally(v).rerouted===1);}
  expect([...answers].sort()).toEqual([false,true]);
  expect((await runMission({monthlyVolume:250000},new AbortController().signal,()=>{})).result.buyIsCheaper).toBe(false);
});

test("the mission reveals the month in groups and stops when cancelled",async()=>{
  const ids:string[]=[];const run=await runMission({monthlyVolume:1000000},new AbortController().signal,e=>ids.push(e.id));
  expect(run.result.days).toHaveLength(30);
  expect(run.result).toMatchObject({rentCents:600000,buyCents:180000,buyIsCheaper:true});
  expect(ids).toEqual(run.trace.map(e=>e.id));expect(ids).toHaveLength(5);
  const c=new AbortController();c.abort();await expect(runMission({monthlyVolume:1000},c.signal,()=>{})).rejects.toThrow();
});
