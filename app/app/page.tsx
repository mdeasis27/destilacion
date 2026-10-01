"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { StatusBadge } from "@/design-system/components/status-badge";
import type { InvoiceFields } from "@/lib/destilacion/types";

type FieldKey = keyof InvoiceFields;

interface ExtractResult {
  invoiceNumber?: string;
  date?: string;
  vendor?: string;
  total?: string;
  currency?: string;
  error?: string;
}

interface HistoryItem {
  id: number;
  invoice_number: string;
  vendor: string;
  total: string;
  currency: string;
  created_at: string;
}

const PREFILL = `INV-2023-014
Date: 2023-11-02
Vendor: Suministros Andinos S.A.
Total: $2,340.50 USD`;

const FIELD_LABELS: Record<FieldKey, string> = {
  invoiceNumber: "Nº factura",
  date: "Fecha",
  vendor: "Vendedor",
  total: "Total",
  currency: "Moneda",
};

const FIELDS: FieldKey[] = ["invoiceNumber", "date", "vendor", "total", "currency"];

export default function AppPage() {
  const [text, setText] = useState(PREFILL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) loadHistory();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.extractions ?? []);
      }
    } catch {
      /* history is best-effort */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

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
            <StatusBadge tone="success" dot className="px-3 py-1">
              Postgres en vivo
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Extrae campos de una factura en vivo</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Pega el texto de una factura y ejecuta el extractor determinista (el proxy del
            student). Los campos extraídos se <strong>persisten en Postgres</strong> y quedan
            guardados en el historial.
          </p>
        </div>

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
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Extrayendo…" : "Extraer campos"}
          </button>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.error && (
              <Alert tone="danger" title="No se pudo extraer">{result.error}</Alert>
            )}

            {!result.error && (
              <Card className="p-5">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {FIELDS.map((key) => (
                    <div key={key} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{FIELD_LABELS[key]}</p>
                      <p className="text-sm font-medium text-foreground break-words">{result[key] || "—"}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de extracciones (persistido en Postgres)</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Factura</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vendedor</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Moneda</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-4 py-2.5 font-mono text-xs text-foreground">{h.invoice_number}</td>
                      <td className="px-4 py-2.5 text-foreground">{h.vendor}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{h.total}</td>
                      <td className="px-4 py-2.5 text-right text-foreground">{h.currency}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
