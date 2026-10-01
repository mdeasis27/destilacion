import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { extractInvoice } from "@/lib/destilacion/extract";

export async function POST(request: Request) {
  let text: string;
  try {
    const body = await request.json();
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Pega el texto de una factura" }, { status: 400 });
  }

  const fields = extractInvoice(text);

  try {
    const db = getSql();
    await db`INSERT INTO destilacion.extractions (invoice_number, vendor, total, currency) VALUES (${fields.invoiceNumber}, ${fields.vendor}, ${fields.total}, ${fields.currency})`;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando en Postgres" },
      { status: 500 },
    );
  }

  return NextResponse.json(fields);
}
