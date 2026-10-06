"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import type { MissionResult } from "./mission";
import { crossingDay, dayCells, revealedDays } from "./scene-state";
import { STORY } from "./story";

// Same status colors as the outcome tape below the drawing.
const FILL: Record<TapeStatus, string> = { served: "fill-success", rerouted: "fill-info", lost: "fill-danger", pending: "fill-foreground/10" };
const PILE = { x: 272, w: 64, top: 36, base: 196 } as const;
const postX = (i: number) => 14 + i * 7.9;
const MOTION = "motion-safe:transition-all motion-safe:duration-500";

function Car() {
  return <g aria-hidden="true">
    <rect x="-15" y="-10" width="30" height="10" rx="3" />
    <rect x="-9" y="-16" width="18" height="8" rx="3" />
    <circle cx="-8" cy="1" r="3.5" className="fill-background stroke-foreground" />
    <circle cx="8" cy="1" r="3.5" className="fill-background stroke-foreground" />
  </g>;
}

/** A rented car drives the month, one post per day; each day drops a receipt on the pile, measured against the price of owning. */
export function DestilacionStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const n = revealedDays(frame, result.days.length, reduced);
  const cells = dayCells(result.days, n);
  const day = crossingDay(cells);
  const cum = result.rentByDayCents;
  const rentSoFar = n ? cum[n - 1] : 0;
  // Scale to the larger of the month's rent and the fixed price, so a high volume never overflows the box.
  const k = (PILE.base - PILE.top) / Math.max(result.rentCents, result.buyCents, 1);
  const lineY = PILE.base - result.buyCents * k;
  const carX = postX(Math.max(0, n - 1));

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <svg viewBox="0 0 360 240" role="img" aria-label={copy.ariaLabel(n, rentSoFar, result.buyCents)} className="mx-auto block h-auto w-full max-w-[560px]" data-rent-pile>
      {/* the pile of rent receipts, one slab per day */}
      <rect x={PILE.x - 4} y={PILE.top} width={PILE.w + 8} height={PILE.base - PILE.top} rx="4" className="fill-none stroke-border" />
      {cum.map((c, i) => {
        const prev = i ? cum[i - 1] : 0;
        return <rect key={i} x={PILE.x} y={PILE.base - c * k} width={PILE.w} height={Math.max(0.5, (c - prev) * k - 0.4)} className={`${FILL[result.days[i]]} ${MOTION}`} style={{ opacity: i < n ? 1 : 0, transitionDelay: reduced ? undefined : `${(i % 6) * 80}ms` }} />;
      })}
      <text x={PILE.x + PILE.w / 2} y="214" fontSize="13" textAnchor="middle" className="fill-foreground font-mono font-semibold" data-pile-total>{`$${(rentSoFar / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</text>
      <text x={PILE.x + PILE.w / 2} y="230" fontSize="11" textAnchor="middle" className="fill-muted-foreground">{copy.pileLabel}</text>

      {/* the price of owning: a parked car and a dashed line across the pile */}
      <line x1="100" x2="352" y1={lineY} y2={lineY} strokeWidth="1.5" strokeDasharray="5 4" className="stroke-foreground" />
      <text x="262" y={lineY + 15} fontSize="12" textAnchor="end" className="fill-foreground" data-own-label>{copy.ownLabel(result.buyCents)}</text>
      <g transform={`translate(240 ${lineY - 4})`} className="fill-muted-foreground"><Car /></g>

      {/* the road with one post per day */}
      <rect x="4" y="200" width="250" height="24" rx="4" className="fill-foreground/10" />
      <line x1="6" x2="252" y1="212" y2="212" strokeDasharray="6 5" className="stroke-muted-foreground" />
      {cells.map((c, i) => <rect key={i} x={postX(i) - 3} y="188" width="6" height="8" rx="1" className={`${FILL[c]} ${MOTION}`} />)}
      {day > 0 ? <text x={postX(day - 1)} y="180" fontSize="10" textAnchor="middle" className="fill-info font-mono font-semibold">{copy.dayShort(day)}</text> : null}
      <g className={`fill-foreground ${reduced ? "" : "transition-transform duration-700 ease-out"}`} style={{ transform: `translate(${carX}px, 218px)` }}><Car /></g>
    </svg>
    <div className="mt-4">
      <p className="font-mono text-sm text-muted-foreground" data-day-progress>{copy.progress(n, rentSoFar)}</p>
      <div className="mt-4"><OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} /></div>
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.crossing(day)}</p>
    </div>
  </StoryStage>;
}
