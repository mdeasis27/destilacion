import { extractInvoice } from "../destilacion/extract";

const TEACHER_CENTS_PER_1000 = 600;
const STUDENT_CENTS_PER_1000 = 0;
const GPU_CENTS_PER_MONTH = 180_000;
const BREAK_EVEN_VOLUME = (GPU_CENTS_PER_MONTH / TEACHER_CENTS_PER_1000) * 1000;
export type ExperienceInput = { invoiceText: string; monthlyVolume: number };
export type ExperienceResult = { fields: ReturnType<typeof extractInvoice>; breakEvenVolume: number; teacherCostCents: number; studentCostCents: number; costCurve: Array<{volume:number;teacherCents:number;studentCents:number}>; recommendation: "api" | "self-host" | "equal"; note: string };
export type TraceEvent = { id: string; step: number; kind: "extract" | "compare"; messageKey: string; timestampMs: number };
function abortIfNeeded(signal:AbortSignal){if(signal.aborted)throw new DOMException("Aborted","AbortError");}
function roundedRateCents(volume:number,ratePerThousand:number){return Math.floor((volume*ratePerThousand+500)/1000);}
function costs(volume:number){return {teacherCents:roundedRateCents(volume,TEACHER_CENTS_PER_1000),studentCents:GPU_CENTS_PER_MONTH+roundedRateCents(volume,STUDENT_CENTS_PER_1000)};}
export async function runExperience(input: ExperienceInput, signal: AbortSignal = new AbortController().signal, onEvent: (event: TraceEvent) => void = () => undefined): Promise<{ input: ExperienceInput; result: ExperienceResult; trace: TraceEvent[]; executionMs: number; mode: "local" }> {
 const start=performance.now();if(!input.invoiceText.trim())throw new Error("Invoice text is required.");if(!Number.isSafeInteger(input.monthlyVolume)||input.monthlyVolume<0||input.monthlyVolume>Math.floor(Number.MAX_SAFE_INTEGER/TEACHER_CENTS_PER_1000))throw new Error("Monthly volume must be a safe non-negative whole number.");abortIfNeeded(signal);
 const fields=extractInvoice(input.invoiceText), volume=input.monthlyVolume, current=costs(volume);const trace:TraceEvent[]=[{id:"extract",step:1,kind:"extract",messageKey:"invoice.extracted",timestampMs:performance.now()-start},{id:"compare",step:2,kind:"compare",messageKey:"costs.compared",timestampMs:performance.now()-start}];
 for(const event of trace){abortIfNeeded(signal);onEvent(event);abortIfNeeded(signal);}const curve=[0,BREAK_EVEN_VOLUME/2,BREAK_EVEN_VOLUME,Math.max(BREAK_EVEN_VOLUME*2,volume)].map(point=>({volume:point,...costs(point)}));
 return {input,result:{fields,breakEvenVolume:BREAK_EVEN_VOLUME,teacherCostCents:current.teacherCents,studentCostCents:current.studentCents,costCurve:curve,recommendation:current.teacherCents===current.studentCents?"equal":current.teacherCents<current.studentCents?"api":"self-host",note:"Rule-based student proxy; costs use integer cents per documented request batch."},trace,executionMs:performance.now()-start,mode:"local"};
}
