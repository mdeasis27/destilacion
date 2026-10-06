import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Destilacion story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the comparison truthfully when renting wins, at a tie and when buying wins", () => {
    expect(STORY.es.compare.sentence(150000, 180000)).toBe("Rentar costó $1,500.00 y comprar $1,800.00. A este volumen, rentar ahorra $300.00.");
    expect(STORY.en.compare.sentence(180000, 180000)).toBe("Both cost the same: $1,800.00 for the month.");
    expect(STORY.en.compare.sentence(600000, 180000)).toContain("buying saves $4,200.00 a month");
    expect([STORY.es.compare.verdict(186000, 180000), STORY.es.compare.verdict(180000, 180000), STORY.es.compare.verdict(1, 180000)]).toEqual(["Comprar salió más barato", "Cuestan lo mismo", "Rentar salió más barato"]);
  });

  it("asks the bet about the volume the visitor chose", () => {
    expect(STORY.en.tryIt.question(250000)).toContain("at 250,000 invoices a month");
    expect(STORY.es.tryIt.question(310000)).toContain("con 310,000 facturas al mes");
    expect(STORY.es.scene.crossing(0)).toBe("Rentar nunca pasó de $1,800");
  });
});
