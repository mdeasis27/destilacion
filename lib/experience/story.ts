import type { Heading } from "@/design-system/demo/project-story";

export interface DestilacionStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (volume: number) => string; yes: string; no: string; volumeLabel: string; volume: (v: number) => string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; rent: string; buy: string; perMonth: string; sentence: (rentCents: number, buyCents: number) => string; verdict: (rentCents: number, buyCents: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; ownLabel: (buyCents: number) => string; pileLabel: string; progress: (day: number, rentCents: number) => string; dayShort: (day: number) => string; ariaLabel: (day: number, rentCents: number, buyCents: number) => string; tapeLabel: string; tape: { served: string; rerouted: string; lost: string }; crossing: (day: number) => string };
}

const n = (v: number, locale: string) => v.toLocaleString(locale);
const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const STORY: Record<"en" | "es", DestilacionStory> = {
  en: {
    name: "Extraction cost tradeoff",
    oneLiner: "If you use it a little, renting pays off; if you use it every day, buying is cheaper. Here you see where they cross.",
    chips: ["Model distillation", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "If you drive twice a month, renting a car is cheaper. If you drive every day, the rentals add up and at some point owning one costs less. The question is how much you drive.",
        "Here the job is reading invoices. Renting is paying a large model per invoice. Buying is running a small model of your own, trained on the large one's answers, for a fixed monthly server cost.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the kilometres", means: "invoices read per month" },
        { term: "renting", means: "a large model, paid per invoice" },
        { term: "buying", means: "your own small model, fixed cost" },
        { term: "the day it pays off", means: "the day renting passes the fixed cost" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "A month of invoices. Renting costs $6 per thousand; your own model costs $1,800 a month however much you use it.",
      question: (v) => `Before you run it, place a bet: at ${n(v, "en-US")} invoices a month, is buying cheaper than renting?`,
      yes: "Yes, buying",
      no: "No, renting",
      volumeLabel: "Invoices per month",
      volume: (v) => n(v, "en-US"),
      note: "Each square is one day of the month. Green means renting is still under $1,800 so far; red means you're paying more than buying would cost.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The month could not be calculated. Try another volume.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "Rent", accent: "or buy" },
      lead: "Same invoices, same month. One option pays per invoice, the other pays a fixed price.",
      rent: "Rent (pay per invoice)",
      buy: "Buy (own model)",
      perMonth: "for the month",
      sentence: (rent, buy) => {
        if (rent === buy) return `Both cost the same: ${usd(rent)} for the month.`;
        if (rent < buy) return `Renting cost ${usd(rent)} and buying ${usd(buy)}. At this volume renting saves ${usd(buy - rent)}.`;
        return `Renting cost ${usd(rent)} and buying ${usd(buy)}. At this volume buying saves ${usd(rent - buy)} a month.`;
      },
      verdict: (rent, buy) => rent > buy ? "Buying was cheaper" : rent === buy ? "They cost the same" : "Renting was cheaper",
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When the same kind of document arrives by the thousands every month and the format barely changes. I think of an accounts payable team reading supplier invoices.",
      notLabel: "Not needed",
      not: "When volume is low or unpredictable, or when documents change so much that the small model would need retraining every few weeks.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I treated the model choice as a cost decision with a break-even point, and I checked that the small model still read the invoices well enough before counting the savings.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "Teacher/student distillation: the large model labels invoices, a small extractor learns from them. On the held-out set it reads 90% of fields right.",
        "Break-even is $1,800 / $6 per thousand = 300,000 invoices a month. At exactly 300,000 both cost the same, so buying is not cheaper.",
        "Money is integer cents. The daily split rounds each day's cumulative invoices the same way as the monthly total, so day 30 equals the month.",
        "The break-even formula is shared with the Python backend and pinned by a fixture; the cents layer and the daily split are TypeScript only.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "What renting cost, day by day",
      caption: "A rented car drives through the month and leaves one receipt a day on the pile. Watch whether the pile passes the line of your own model.",
      ownLabel: (buy) => `Own model: ${usd(buy)}`,
      pileLabel: "rent receipts",
      progress: (day, rent) => day === 0 ? "Day 0" : `Day ${day} · renting is at ${usd(rent)}`,
      dayShort: (day) => `day ${day}`,
      ariaLabel: (day, rent, buy) => `A rented car drives through the month, one post per day, and leaves a receipt on the pile each day. By day ${day} renting has cost ${usd(rent)}, against ${usd(buy)} for your own model.`,
      tapeLabel: "Thirty days of the month",
      tape: { served: "renting still cheaper", rerouted: "day renting passed buying", lost: "paying more than buying" },
      crossing: (day) => day === 0 ? "Renting never passed $1,800" : `Renting passed $1,800 on day ${day}`,
    },
  },
  es: {
    name: "Destilación",
    oneLiner: "Si lo usas poco, rentar conviene; si lo usas diario, comprar sale más barato. Aquí ves dónde se cruzan.",
    chips: ["Destilación de modelos", "2 min", "Demo en vivo"],
    analogy: {
      heading: { accent: "La analogía" },
      paragraphs: [
        "Si manejas dos veces al mes, rentar un coche sale más barato. Si manejas diario, las rentas se acumulan y en algún punto tener uno propio cuesta menos. La pregunta es cuánto manejas.",
        "Aquí el trabajo es leer facturas. Rentar es pagarle a un modelo grande por cada factura. Comprar es tener tu propio modelo pequeño, entrenado con las respuestas del grande, por un costo fijo de servidor al mes.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "los kilómetros", means: "facturas leídas al mes" },
        { term: "rentar", means: "un modelo grande, se paga por factura" },
        { term: "comprar", means: "tu propio modelo pequeño, costo fijo" },
        { term: "el día que conviene", means: "el día que rentar pasa el costo fijo" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Un mes de facturas. Rentar cuesta $6 por cada mil; tu propio modelo cuesta $1,800 al mes sin importar cuánto lo uses.",
      question: (v) => `Antes de correrlo, apuesta: con ${n(v, "es-MX")} facturas al mes, ¿sale más barato comprar que rentar?`,
      yes: "Sí, comprar",
      no: "No, rentar",
      volumeLabel: "Facturas al mes",
      volume: (v) => n(v, "es-MX"),
      note: "Cada cuadrito es un día del mes. Verde quiere decir que rentar va por debajo de $1,800 hasta ese día; rojo, que ya pagas más de lo que costaría comprar.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudo calcular el mes. Prueba con otro volumen.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Rentar", accent: "o comprar" },
      lead: "Mismas facturas, mismo mes. Una opción paga por factura y la otra paga un precio fijo.",
      rent: "Rentar (pago por factura)",
      buy: "Comprar (modelo propio)",
      perMonth: "en el mes",
      sentence: (rent, buy) => {
        if (rent === buy) return `Los dos cuestan lo mismo: ${usd(rent)} en el mes.`;
        if (rent < buy) return `Rentar costó ${usd(rent)} y comprar ${usd(buy)}. A este volumen, rentar ahorra ${usd(buy - rent)}.`;
        return `Rentar costó ${usd(rent)} y comprar ${usd(buy)}. A este volumen, comprar ahorra ${usd(rent - buy)} al mes.`;
      },
      verdict: (rent, buy) => rent > buy ? "Comprar salió más barato" : rent === buy ? "Cuestan lo mismo" : "Rentar salió más barato",
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve", after: "?" },
      worthLabel: "Vale la pena",
      worth: "Cuando el mismo tipo de documento llega por miles cada mes y el formato casi no cambia. Pienso en un equipo de cuentas por pagar leyendo facturas de proveedores.",
      notLabel: "No hace falta",
      not: "Cuando el volumen es bajo o impredecible, o cuando los documentos cambian tanto que habría que reentrenar el modelo pequeño cada pocas semanas.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Traté la elección del modelo como una decisión de costo con un punto de equilibrio, y revisé que el modelo pequeño leyera bien las facturas antes de contar el ahorro.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Destilación maestro/alumno: el modelo grande etiqueta facturas y un extractor pequeño aprende de ellas. En el conjunto de prueba lee bien el 90% de los campos.",
        "El punto de equilibrio es $1,800 / $6 por mil = 300,000 facturas al mes. Con 300,000 exactas los dos cuestan lo mismo, así que comprar no sale más barato.",
        "El dinero va en centavos enteros. La división por día redondea las facturas acumuladas igual que el total del mes, así que el día 30 coincide con el mes.",
        "La fórmula del punto de equilibrio se comparte con el backend en Python y la fija un fixture; la capa en centavos y la división por día son solo TypeScript.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Lo que costó rentar, día por día",
      caption: "Un coche rentado recorre el mes y deja un recibo por día en la pila. Mira si la pila pasa la línea de tu propio modelo.",
      ownLabel: (buy) => `Modelo propio: ${usd(buy)}`,
      pileLabel: "recibos de renta",
      progress: (day, rent) => day === 0 ? "Día 0" : `Día ${day} · rentar lleva ${usd(rent)}`,
      dayShort: (day) => `día ${day}`,
      ariaLabel: (day, rent, buy) => `Un coche rentado recorre el mes, un poste por día, y cada día deja un recibo en la pila. Al día ${day}, rentar lleva ${usd(rent)} contra ${usd(buy)} de tu propio modelo.`,
      tapeLabel: "Treinta días del mes",
      tape: { served: "rentar aún más barato", rerouted: "día que rentar pasó a comprar", lost: "pagando más que comprar" },
      crossing: (day) => day === 0 ? "Rentar nunca pasó de $1,800" : `Rentar pasó de $1,800 el día ${day}`,
    },
  },
};
