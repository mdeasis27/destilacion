"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { FlowDiagram, type FlowTone } from "@/design-system/demo/flow-diagram";
import type { MissionResult } from "./mission";
import { crossingDay, dayCells, revealedDays } from "./scene-state";
import { STORY } from "./story";

const POS = { requests: { x: 10, y: 95 }, app: { x: 230, y: 95 }, rent: { x: 470, y: 20 }, buy: { x: 470, y: 170 } } as const;

export function DestilacionStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const cells = dayCells(result.days, revealedDays(frame, result.days.length, reduced));
  const day = crossingDay(cells);
  const tone: Record<keyof typeof POS, FlowTone> = { requests: "idle", app: "active", rent: day > 0 ? "danger" : "success", buy: day > 0 ? "success" : "idle" };
  const nodes = (Object.keys(POS) as (keyof typeof POS)[]).map(id => ({ id, ...POS[id], ...copy.nodes[id], tone: tone[id] }));
  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <FlowDiagram nodes={nodes} width={640} height={260} ariaLabel={copy.crossing(day)} statusLabels={copy.statusLabels} edges={[
      { from: "requests", to: "app" },
      { from: "app", to: "rent", tone: day > 0 ? "danger" : "success" },
      { from: "app", to: "buy", tone: day > 0 ? "success" : "idle" },
    ]} />
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.crossing(day)}</p>
    </div>
  </StoryStage>;
}
