import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { DayStatus } from "./mission";

export function dayCells(days: readonly DayStatus[], revealed: number): TapeStatus[] {
  return days.map((d, i) => (i >= revealed ? "pending" : d));
}

export function revealedDays(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

/** 1-based day renting passed the fixed cost among the revealed cells, or 0. */
export function crossingDay(cells: readonly TapeStatus[]): number {
  return cells.indexOf("rerouted") + 1;
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };
