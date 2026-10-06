import {GPU_CENTS_PER_MONTH, TEACHER_CENTS_PER_1000, roundedRateCents, runExperience, type ExperienceResult} from "./adapter";

export function costDecision(result:Pick<ExperienceResult,"teacherCostCents"|"studentCostCents">):"api"|"local"|"equal" {
  if (result.teacherCostCents === result.studentCostCents) return "equal";
  return result.teacherCostCents < result.studentCostCents ? "api" : "local";
}

export type DayStatus = "served" | "rerouted" | "lost";
export type MissionInput = {monthlyVolume:number};
export type MissionResult = {days:DayStatus[]; rentByDayCents:number[]; rentCents:number; buyCents:number; buyIsCheaper:boolean};
type Event = {id:string;step:number;kind:string;messageKey:string;timestampMs:number};

const DAYS = 30, STEP = 6;

/** Day by day: renting still under the purchase price, the day it goes over, or days paying more. */
/** What renting has cost by the end of each day, in cents; day 30 rounds like the monthly total. */
export function rentByDayCents(volume:number):number[] {
  return Array.from({length:DAYS},(_,i)=>roundedRateCents(Math.floor(volume*(i+1)/DAYS),TEACHER_CENTS_PER_1000));
}

export function monthDays(volume:number):DayStatus[] {
  let crossed=false;
  return rentByDayCents(volume).map(rentSoFar=>{
    if(rentSoFar<=GPU_CENTS_PER_MONTH)return "served";
    if(crossed)return "lost";
    crossed=true;return "rerouted";
  });
}

/** Story mission: the real cost adapter for the month, plus the month split into days. */
export async function runMission(input:MissionInput,signal:AbortSignal,onEvent:(e:Event)=>void):Promise<{input:MissionInput;result:MissionResult;trace:Event[];executionMs:number;mode:"local"}> {
  const start=performance.now();
  const run=await runExperience({invoiceText:"INV-104",monthlyVolume:input.monthlyVolume},signal,()=>{});
  const trace:Event[]=[];
  for(let d=0;d<DAYS;d+=STEP){
    if(signal.aborted)throw new DOMException("Aborted","AbortError");
    const e={id:`days-${d/STEP+1}`,step:d/STEP+1,kind:"cost",messageKey:`days.${d/STEP+1}`,timestampMs:performance.now()-start};
    trace.push(e);onEvent(e);
  }
  if(signal.aborted)throw new DOMException("Aborted","AbortError");
  const r=run.result;
  return {input,result:{days:monthDays(input.monthlyVolume),rentByDayCents:rentByDayCents(input.monthlyVolume),rentCents:r.teacherCostCents,buyCents:r.studentCostCents,buyIsCheaper:costDecision(r)==="local"},trace,executionMs:performance.now()-start,mode:"local"};
}
