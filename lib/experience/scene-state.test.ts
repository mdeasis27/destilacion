import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { crossingDay, dayCells, revealedDays } from "./scene-state";
import { runMission } from "./mission";

it("hides unrevealed days and finds the crossing day among the revealed ones", () => {
  const days = ["served", "rerouted", "lost"] as const;
  expect(dayCells(days, 1)).toEqual(["served", "pending", "pending"]);
  expect(crossingDay(dayCells(days, 1))).toBe(0);
  expect(crossingDay(dayCells(days, 3))).toBe(2);
});

it("final tape matches the month: at 1,000,000 renting passes on day 10", async () => {
  const { result } = await runMission({ monthlyVolume: 1000000 }, new AbortController().signal, () => {});
  const cells = dayCells(result.days, 30);
  expect(tapeCounts(cells)).toEqual({ served: 9, rerouted: 1, lost: 20, pending: 0 });
  expect(crossingDay(cells)).toBe(10);
});

it("reveals in proportion to playback, all of it when complete or under reduced motion", () => {
  expect(revealedDays({ visible: 1, total: 5, complete: false }, 30, false)).toBe(6);
  expect(revealedDays({ visible: 5, total: 5, complete: true }, 30, false)).toBe(30);
  expect(revealedDays({ visible: 1, total: 5, complete: false }, 30, true)).toBe(30);
});
