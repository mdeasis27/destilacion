"use client";
import { useState } from "react";
import { ScenarioPicker } from "@/design-system/demo/decision-lab";
import { MissionBrief, MissionPrompt, MissionComparison, DecisionNotes } from "@/design-system/demo/mission-lab";
import { TracePlayer } from "@/design-system/demo/trace-player";
import { useDemoRun } from "@/design-system/demo/use-demo-run";
import { runExperience } from "@/lib/experience/adapter";
import { costDecision } from "@/lib/experience/mission";
import type { Locale } from "@/design-system/i18n/locale";
import { traceCopy } from "@/lib/experience/trace-copy";
import { InvoiceCostScene } from "./invoice-cost-scene";
const invoice = "INV-104\nVendor: Supplier A\n2026-01-10\nTotal: $480.00 USD";
const presets = { pilot: 120000, scale: 1000000 };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
export function Experience({ locale }: {
    locale: Locale;
}) {
    const en = locale === "en";
    const [preset, setPreset] = useState<"pilot" | "scale" | null>("pilot");
    const [invoiceText, setInvoiceText] = useState(invoice);
    const [monthlyVolume, setMonthlyVolume] = useState(presets.pilot);
    const [prediction, setPrediction] = useState<string | null>(null);
    const demo = useDemoRun(runExperience);
    const result = demo.run?.result;
    const clear = () => { setPrediction(null); demo.reset(); };
    const choose = (id: "pilot" | "scale") => { setPreset(id); setInvoiceText(invoice); setMonthlyVolume(presets[id]); clear(); };
    const manual = (update: () => void) => { update(); setPreset(null); clear(); };
    return <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{en ? "Changing language resets the scenario." : "Cambiar idioma reinicia el escenario."}</p><a aria-label={en ? "View in Spanish" : "Ver en inglés"} href={`/${en ? "es" : "en"}/app`} className="rounded-lg border border-border px-4 py-2 text-sm">{en ? "ES" : "EN"}</a></div>
    <MissionBrief locale={locale} name="DESTILACIÓN" title={en ? "When does local capacity pay off?" : "¿Cuándo conviene la capacidad local?"} context={en ? "An invoice-processing team expects growing demand. Compare a per-request API rate with fixed local capacity and find where their monthly costs meet." : "Un equipo que procesa facturas espera una demanda creciente. Compara una tarifa API por solicitud con capacidad local fija y encuentra dónde se igualan los costos mensuales."} role={en ? "AI product owner" : "Responsable de producto de IA"} stakes={en ? "Recurring operating cost" : "Costo operativo recurrente"}/>
    <ScenarioPicker locale={locale} selected={preset ?? undefined} onSelect={id => choose(id as "pilot" | "scale")} options={[{ id: "pilot", label: en ? "Pilot volume" : "Volumen piloto", description: en ? "120,000 requests per month." : "120,000 solicitudes al mes." }, { id: "scale", label: en ? "Scale volume" : "Volumen a escala", description: en ? "1,000,000 requests per month." : "1,000,000 solicitudes al mes." }]}/>
    <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
      <section className="min-w-0 rounded-xl border border-border p-5">
    <button type="button" data-mission-challenge className="mb-6 rounded-lg border border-accent px-4 py-3 text-sm" onClick={() => manual(() => { setInvoiceText(invoice); setMonthlyVolume(300000); })}>{en ? "Try the challenge: exact break-even" : "Probar el reto: equilibrio exacto"} →</button>

        <label className="block text-sm">{en ? "Invoice text" : "Texto de factura"}<textarea aria-label={en ? "Invoice text" : "Texto de factura"} value={invoiceText} onChange={e => manual(() => setInvoiceText(e.target.value))} rows={6} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 font-mono text-sm"/></label>
        <label className="mt-4 block text-sm">{en ? "Monthly requests" : "Solicitudes mensuales"}: {monthlyVolume.toLocaleString(en ? "en-US" : "es-MX")}<input aria-label={en ? "Monthly requests" : "Solicitudes mensuales"} type="range" min="10000" max="1000000" step="10000" value={monthlyVolume} onChange={e => manual(() => setMonthlyVolume(Number(e.target.value)))} className="mt-3 w-full"/></label>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{en ? "Scenario assumptions: $6 per 1,000 API requests; $1,800 per month for local capacity. These are illustrative inputs, not current vendor prices." : "Supuestos del escenario: $6 por 1,000 solicitudes API; $1,800 mensuales de capacidad local. Son datos ilustrativos, no precios actuales de proveedores."}</p>
        <MissionPrompt locale={locale} question={en ? "At your selected volume, which option costs less under these assumptions?" : "Con el volumen elegido, ¿qué opción cuesta menos bajo estos supuestos?"} prediction={prediction} onPredict={setPrediction} locked={Boolean(demo.run) || demo.running} options={[{ id: "api", label: en ? "API costs less" : "API cuesta menos" }, { id: "local", label: en ? "Local costs less" : "Local cuesta menos" }, { id: "equal", label: en ? "Equal costs" : "Costos iguales" }]}/>
        <button data-run-experiment disabled={demo.running} onClick={() => demo.execute({ invoiceText, monthlyVolume })} className="mt-5 w-full rounded-lg bg-foreground px-4 py-3 text-background">{en ? "Calculate costs" : "Calcular costos"}</button>
        <div className="mt-2 grid grid-cols-2 gap-2"><button onClick={demo.cancel} className="rounded-lg border p-3">{en ? "Cancel" : "Cancelar"}</button><button onClick={() => choose("pilot")} className="rounded-lg border p-3">{en ? "Reset" : "Reiniciar"}</button></div>
        {demo.error && <p role="alert" className="mt-4 text-sm text-danger">{en ? demo.error : "Introduce texto de factura y un volumen mensual entero no negativo."}</p>}
      </section>
      <section className="min-w-0">
        {result && demo.run ? <TracePlayer collapsible trace={demo.trace} locale={locale} executionMs={demo.run.executionMs} translate={key => traceCopy(locale, key)} renderStage={frame => <>
          <InvoiceCostScene frame={frame} result={result} volume={demo.run!.input.monthlyVolume} locale={locale}/>
          {frame.complete && <MissionComparison locale={locale} prediction={prediction} actual={costDecision(result)} actualLabel={costDecision(result) === "equal" ? (en ? "Both options have equal costs." : "Ambas opciones tienen costos iguales.") : costDecision(result) === "api" ? (en ? "API costs less." : "API cuesta menos.") : (en ? "Local capacity costs less." : "La capacidad local cuesta menos.")} sides={[
                        { label: en ? "Per-request API" : "API por solicitud", value: money(result.teacherCostCents), detail: en ? "Computed monthly cost for your volume." : "Costo mensual calculado para tu volumen.", positive: costDecision(result) === "api" },
                        { label: en ? "Fixed local capacity" : "Capacidad local fija", value: money(result.studentCostCents), detail: en ? "Computed monthly cost under the local-capacity assumption." : "Costo mensual calculado bajo el supuesto de capacidad local.", positive: costDecision(result) === "local" },
                    ]} explanation={en ? `Same invoice and monthly volume. Only the cost model changes. Difference: ${money(Math.abs(result.teacherCostCents - result.studentCostCents))} per month. This excludes maintenance, staffing, capacity constraints and quality differences.` : `Misma factura y volumen mensual. Solo cambia el modelo de costo. Diferencia: ${money(Math.abs(result.teacherCostCents - result.studentCostCents))} al mes. No incluye mantenimiento, personal, límites de capacidad ni diferencias de calidad.`}/>}</>}/> : <p className="rounded-xl border border-border p-6 text-muted-foreground">{en ? "Predict, calculate, then reveal both costs at the end of the trace." : "Predice, calcula y revela ambos costos al finalizar la traza."}</p>}
      </section>
    </div>
    <DecisionNotes locale={locale} implementation={en ? "Rule-based invoice-field extraction and a cost curve calculated in integer cents." : "Extracción de campos de factura con reglas y curva de costo calculada en centavos enteros."} rationale={en ? "A transparent capacity model makes the crossover inspectable. This student proxy does not demonstrate a trained distilled model or equivalent extraction quality." : "Un modelo de capacidad transparente permite inspeccionar el cruce. Este sustituto no demuestra un modelo destilado entrenado ni calidad de extracción equivalente."} production={en ? "Measure extraction quality on labeled invoices, real throughput, utilization, operating expenses and data privacy before choosing infrastructure." : "Medir calidad de extracción en facturas etiquetadas, rendimiento real, utilización, gastos operativos y privacidad antes de elegir infraestructura."}/>
  </main>;
}
