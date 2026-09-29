"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { Meter } from "@/design-system/components/meter";
import { StatusBadge } from "@/design-system/components/status-badge";
import { getComparison } from "@/lib/destilacion/demo";
import { extractInvoice } from "@/lib/destilacion/extract";
import type { InvoiceDocument, InvoiceFields } from "@/lib/destilacion/types";
import documents from "@/lib/destilacion/data/documents.json";

const DATA = getComparison();
const DOCS = documents as readonly InvoiceDocument[];

const FIELD_LABELS: Record<string, string> = {
  invoiceNumber: "Nº factura",
  date: "Fecha",
  vendor: "Vendedor",
  total: "Total",
  currency: "Moneda",
};

const FIELDS = Object.keys(FIELD_LABELS);

export default function AppPage() {
  const quality = DATA.quality;
  const cost = DATA.cost;
  const latency = DATA.latency;
  const be = cost.breakEvenVolume;
  const maxSeriesTeacher = Math.max(...DATA.series.map((p) => p.teacher), cost.gpuMonthlyCost);

  const [text, setText] = useState(DOCS[0].text);
  const [result, setResult] = useState<{ fields: InvoiceFields; gold: InvoiceFields | null } | null>(null);

  function run() {
    const fields = extractInvoice(text);
    const gold = DOCS.find((d) => d.text === text)?.gold ?? null;
    setResult({ fields, gold });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Destilación</h1>
                <p className="text-xs text-muted-foreground">LoRA vs frontier · break-even</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="info" dot className="px-3 py-1">
              Demo mode
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* ── SUMMARY BAR ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Student accuracy"
            value={`${(quality.studentAccuracy * 100).toFixed(1)}%`}
            hint="LoRA 8B proxy, medido"
            tone={quality.studentAccuracy >= 0.9 ? "success" : "warning"}
          />
          <MetricCard
            label="Teacher accuracy"
            value={`${(quality.teacherAccuracy * 100).toFixed(1)}%`}
            hint="frontier, precomputado"
            tone="info"
          />
          <MetricCard
            label="Break-even"
            value={`${(be / 1000).toFixed(0)}k`}
            hint="req/mes"
            tone="success"
          />
          <MetricCard
            label="Latencia ×"
            value={`${latency.speedup.toFixed(0)}×`}
            hint="más rápido self-host"
            tone="success"
          />
        </div>

        {/* ── PLAYGROUND ──────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Extracción en vivo</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Pega el texto de una factura y ejecuta el extractor determinista (el proxy del
            student). Si el texto coincide con un documento etiquetado, compara cada campo
            contra su gold.
          </p>

          <Card className="p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-sm text-foreground">Texto de la factura</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
            <button
              onClick={run}
              className="w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors"
            >
              Extraer campos
            </button>
          </Card>

          {result && (
            <Card className="mt-4 p-5">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {FIELDS.map((key) => {
                  const value = result.fields[key as keyof InvoiceFields];
                  const gold = result.gold ? result.gold[key as keyof InvoiceFields] : null;
                  const hasGold = result.gold !== null;
                  const match = hasGold && value === gold;
                  return (
                    <div key={key} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{FIELD_LABELS[key]}</p>
                      <p className="text-sm font-medium text-foreground break-words">{value || "—"}</p>
                      <div className="mt-2">
                        {hasGold ? (
                          <StatusBadge tone={match ? "success" : "danger"} dot>
                            {match ? "coincide" : "difiere"}
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">sin referencia</StatusBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {result.gold && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Comparado contra el gold del documento etiquetado. Edita el texto para que deje
                  de coincidir con un documento conocido y verás los campos sin referencia.
                </p>
              )}
            </Card>
          )}
        </section>

        {/* ── QUALITY ─────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Calidad (exact-match por campo)</h2>
          <p className="text-sm text-muted-foreground mb-5">
            El student se mide corriendo el extractor determinista sobre el split de test
            (intacto); el teacher es una constante precomputada y documentada. La brecha de{" "}
            {quality.deltaPp.toFixed(1)}pp es el precio del ahorro.
          </p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
            {FIELDS.map((key) => {
              const stat = DATA.byField[key as keyof typeof DATA.byField];
              return (
                <Card key={key} className="p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{FIELD_LABELS[key]}</p>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {(stat.accuracy * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.correct}/{stat.total}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── COST + BREAK-EVEN ───────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Coste y break-even</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Self-host no es &quot;más barato por token&quot; — es un coste fijo de{" "}
            <span className="text-foreground">${cost.gpuMonthlyCost}/mes</span> (1× GPU). Gana solo
            cuando el volumen supera el punto donde la factura fija es menor que el API.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Teacher / 1k</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                ${(cost.teacherPer1k * 1000).toFixed(0)}<span className="text-sm text-muted-foreground">/1M</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">${cost.teacherPer1k.toFixed(4)}/1k · ${cost.teacherPerRequest.toFixed(3)}/req</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Self-host fijo</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                ${cost.gpuMonthlyCost.toLocaleString()}<span className="text-sm text-muted-foreground">/mes</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">marginal ≈ $0/1k (GPU ya pagada)</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Break-even</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {(be / 1000).toFixed(0)}k<span className="text-sm text-muted-foreground"> req/mes</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">por debajo, el API gana</p>
            </Card>
          </div>

          <Card className="mt-5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Coste mensual total por volumen (USD)
            </p>
            <div className="space-y-3">
              {DATA.series.map((point) => {
                const isBreakEven = point.volume === be;
                const teacherPct = (point.teacher / maxSeriesTeacher) * 100;
                const studentPct = (point.student / maxSeriesTeacher) * 100;
                return (
                  <div key={point.volume} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="tabular-nums">{(point.volume / 1000).toFixed(0)}k req/mes</span>
                      <span className="tabular-nums">
                        teacher ${point.teacher.toLocaleString()} · self-host ${point.student.toLocaleString()}
                        {isBreakEven && <span className="ml-2 text-warning font-semibold">break-even</span>}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2 rounded-[var(--radius-pill)] bg-info" style={{ width: `${teacherPct}%` }} title="teacher" />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2 rounded-[var(--radius-pill)] bg-success" style={{ width: `${studentPct}%` }} title="self-host" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-info" /> Teacher (API)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-success" /> Self-host (GPU fijo)</span>
            </div>
          </Card>
        </section>

        {/* ── LATENCY ─────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Latencia p95</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">Teacher (API round-trip)</span>
                <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{latency.teacherP95Ms}ms</span>
              </div>
              <Meter className="mt-4" value={latency.teacherP95Ms} max={latency.teacherP95Ms} tone="info" />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">Student (self-host 8B)</span>
                <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{latency.studentP95Ms}ms</span>
              </div>
              <Meter className="mt-4" value={latency.studentP95Ms} max={latency.teacherP95Ms} tone="success" />
            </Card>
          </div>
        </section>

        {/* ── SPLIT / LABELING ────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Split y labeling</h2>
          <Alert tone="info" title="Test intacto">
            {DATA.splitCounts.train} train · {DATA.splitCounts.val} val · {DATA.splitCounts.test} test. Las reglas del
            extractor se escribieron sobre train/val; el split de test solo se usa para la medición final
            (ver LABELING.md). El &quot;student&quot; de la demo es un extractor determinista, un proxy
            documentado de un LoRA 8B real.
          </Alert>
        </section>

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Destilación · LoRA vs frontier · Demo mode</span>
          <a href="https://github.com/mdeasis27/destilacion" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
