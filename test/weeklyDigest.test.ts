import { describe, it, expect } from "vitest";
import { computeWeeklyDigest } from "../src/detection/weeklyDigest";
import { generateWeekEvents } from "../src/seed/seedWeek";

describe("computeWeeklyDigest", () => {
  it("computes nights worked, longest streak, and tone trend from seeded week", () => {
    const now = Date.now();
    const weekStart = now - 7 * 24 * 3_600_000;
    const events = generateWeekEvents("U1", {
      endTs: now,
      nightsPastThreshold: 4,
      longestNoBreakHours: 6.5,
      worseningTone: true,
    });

    const result = computeWeeklyDigest(events, weekStart, now);

    expect(result.nightsWorkedPastThreshold).toBe(4);
    expect(result.longestNoBreakStreakHours).toBeGreaterThanOrEqual(6);
    expect(result.toneTrend).toBe("worsening");
    expect(result.toneIsHeuristic).toBe(true);
  });

  it("reports flat tone trend and zero nights for a quiet week", () => {
    const now = Date.now();
    const weekStart = now - 7 * 24 * 3_600_000;
    const events = generateWeekEvents("U1", {
      endTs: now,
      nightsPastThreshold: 0,
      longestNoBreakHours: 1,
      worseningTone: false,
    });

    const result = computeWeeklyDigest(events, weekStart, now);

    expect(result.nightsWorkedPastThreshold).toBe(0);
    expect(result.toneTrend).toBe("flat");
  });
});
