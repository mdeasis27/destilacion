import {OutcomeBlock,StoryStage} from "@/design-system/demo/decision-lab";
import type {PlaybackFrame} from "@/design-system/demo/playback";
import {costDecision} from "@/lib/experience/mission";
import type {ExperienceResult} from "@/lib/experience/adapter";
import type {TraceEvent} from "@/design-system/demo/types";

const labels:Record<string,[string,string]>={invoiceNumber:["Invoice number","Número de factura"],vendor:["Supplier","Proveedor"],date:["Date","Fecha"],total:["Total","Total"],currency:["Currency","Moneda"]};
const money=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
export function InvoiceCostScene({frame,result,volume,locale}:{frame:PlaybackFrame<TraceEvent>;result:ExperienceResult;volume:number;locale:"en"|"es"}){
 const es=locale==="es";
 const points=[...result.costCurve,{volume,teacherCents:result.teacherCostCents,studentCents:result.studentCostCents}].sort((a,b)=>a.volume-b.volume);
 const maximumVolume=Math.max(...points.map(p=>p.volume),1);
 const maximumCost=Math.max(...points.flatMap(p=>[p.teacherCents,p.studentCents]),1);
 const x=(value:number)=>55+value/maximumVolume*420;
 const y=(cents:number)=>205-cents/maximumCost*165;
 return <StoryStage locale={locale} title={es?"De la factura a la decisión de capacidad":"From invoice to capacity decision"} caption={es?"Primero se extraen campos. Después se comparan costos mensuales bajo los supuestos del prototipo; las coordenadas usan volúmenes reales.":"Fields are extracted first. Monthly costs are then compared under the prototype assumptions; coordinates use actual request volumes."} step={frame.visible} total={frame.total}>
  <div className="space-y-6">
   <section><p className="mb-4 font-mono text-xs uppercase text-info">01 / {es?"Factura extraída":"Extracted invoice"}</p><dl className="grid gap-3 sm:grid-cols-3">{Object.entries(result.fields).map(([key,value])=><div key={key} className="border-l-2 border-info pl-3"><dt className="text-xs text-muted-foreground">{labels[key]?.[es?1:0]??key}</dt><dd className="mt-1 break-words text-sm">{value||"—"}</dd></div>)}</dl></section>
   {frame.visible>=2?<section><p className="mb-3 font-mono text-xs uppercase text-info">02 / {es?"Capacidad mensual":"Monthly capacity"}</p>
    <p className="mb-2 text-sm text-muted-foreground sm:hidden">{es?"Desliza la curva para inspeccionar los costos →":"Scroll the curve to inspect costs →"}</p><div className="overflow-x-auto" tabIndex={0} role="region" aria-label={es?"Curva de costo; desplázala horizontalmente":"Cost curve; scroll horizontally"}><svg role="img" aria-label={es?"Curvas de costo mensual y punto de equilibrio":"Monthly cost curves and break-even point"} viewBox="0 0 530 260" className="h-auto w-full min-w-[530px]">
     <path d="M55 35V205H475" fill="none" stroke="var(--border)" strokeWidth="2"/>
     {[0,.5,1].map(fraction=><g key={fraction}><line x1="55" x2="475" y1={y(maximumCost*fraction)} y2={y(maximumCost*fraction)} stroke="var(--border)" strokeDasharray="3 5"/><text x="47" y={y(maximumCost*fraction)+4} textAnchor="end" fill="var(--muted)" fontSize="14">{Math.round(maximumCost*fraction/100)}</text></g>)}
     <polyline fill="none" stroke="var(--info)" strokeWidth="3" points={points.map(p=>`${x(p.volume)},${y(p.teacherCents)}`).join(" ")}/>
     <polyline fill="none" stroke="var(--success)" strokeWidth="3" points={points.map(p=>`${x(p.volume)},${y(p.studentCents)}`).join(" ")}/>
     <line x1={x(result.breakEvenVolume)} x2={x(result.breakEvenVolume)} y1="35" y2="205" stroke="var(--warning)" strokeDasharray="5 4"/>
     <circle cx={x(volume)} cy={y(result.teacherCostCents)} r="5" fill="var(--info)"/><circle cx={x(volume)} cy={y(result.studentCostCents)} r="5" fill="var(--success)"/>
     <text x="55" y="20" fill="var(--muted)" fontSize="14">USD / {es?"mes":"month"}</text><text x="265" y="250" textAnchor="middle" fill="var(--muted)" fontSize="14">{es?"Solicitudes mensuales":"Monthly requests"}</text>
     {[0,maximumVolume/2,maximumVolume].map(v=><text key={v} x={x(v)} y="226" textAnchor="middle" fill="var(--muted)" fontSize="14">{Math.round(v/1000)}k</text>)}
    </svg></div>
    <div className="flex flex-wrap gap-4 text-xs"><span className="text-info">● {es?"API":"API"}</span><span className="text-success">● {es?"Capacidad local":"Local capacity"}</span><span className="text-warning">{es?"Equilibrio":"Break-even"}: {result.breakEvenVolume.toLocaleString()}</span></div>
    {frame.complete&&<p className="mt-4 text-sm">{volume.toLocaleString()} {es?"solicitudes":"requests"} → API {money(result.teacherCostCents)} / {es?"local":"local"} {money(result.studentCostCents)}</p>}
   </section>:<p className="self-center text-sm text-muted-foreground">{es?"La curva de costo se revela después de extraer la factura.":"The cost curve is revealed after extracting the invoice."}</p>}
  </div>
  {frame.complete&&<div className="mt-6"><OutcomeBlock tone={costDecision(result)==="equal"?"warning":costDecision(result)==="api"?"info":"success"} title={costDecision(result)==="equal"?(es?"Costos iguales: evalúa operación y calidad":"Equal costs: evaluate operations and quality"):costDecision(result)==="api"?(es?"Mantén la tarifa API":"Keep the API rate"):(es?"Planea capacidad local":"Plan local capacity")} explanation={es?"La comparación usa una tarifa supuesta de $6 por 1,000 solicitudes y $1,800 de capacidad local mensual. No incluye operación, mantenimiento ni diferencias de calidad.":"The comparison assumes $6 per 1,000 requests and $1,800 monthly local capacity. Operations, maintenance and quality differences are excluded."}/></div>}
 </StoryStage>;
}
