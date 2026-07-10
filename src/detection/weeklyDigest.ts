import { ActivityEvent, ToneTrend, WeeklyDigestResult } from "../types";
import { config } from "../config";
import { findLongestStreak } from "./shared";

// Uses UTC throughout: seed data and stored events are constructed with
// UTC-aligned arithmetic, so UTC hour/day boundaries keep detection
// consistent regardless of the host process's local timezone. A real
// deployment would resolve this per-user from their Slack profile tz.
function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function countNightsWorkedPastThreshold(events: ActivityEvent[]): number {
  const nights = new Set<string>();
  for (const e of events) {
    const hour = new Date(e.ts).getUTCHours();
    if (hour >= config.nightThresholdHour || hour < 5) {
      nights.add(dayKey(e.ts));
    }
  }
  return nights.size;
}

/**
 * Heuristic tone trend: average message length as a terseness proxy,
 * comparing the first half of the week to the second half. Clearly labeled
 * as heuristic (not Slack AI sentiment) via toneIsHeuristic on the result.
 */
function computeToneTrend(events: ActivityEvent[]): { trend: ToneTrend; isHeuristic: boolean } {
  const withText = [...events]
    .filter((e) => e.type === "message" && typeof e.text === "string")
    .sort((a, b) => a.ts - b.ts);

  if (withText.length < 4) {
    return { trend: "flat", isHeuristic: true };
  }

  const mid = Math.floor(withText.length / 2);
  const firstHalf = withText.slice(0, mid);
  const secondHalf = withText.slice(mid);

  const avgLen = (arr: ActivityEvent[]) =>
    arr.reduce((sum, e) => sum + (e.text?.length ?? 0), 0) / arr.length;

  const before = avgLen(firstHalf);
  const after = avgLen(secondHalf);

  if (before === 0) return { trend: "flat", isHeuristic: true };

  const pctChange = (after - before) / before;
  if (pctChange <= -0.15) return { trend: "worsening", isHeuristic: true }; // getting terser
  if (pctChange >= 0.15) return { trend: "improving", isHeuristic: true };
  return { trend: "flat", isHeuristic: true };
}

/** Concept C — weekly reflective digest aggregation. */
export function computeWeeklyDigest(
  events: ActivityEvent[],
  weekStart: number,
  weekEnd: number
): WeeklyDigestResult {
  const windowed = events.filter((e) => e.ts >= weekStart && e.ts <= weekEnd);

  const streak = findLongestStreak(windowed, config.breakGapMinutesThreshold);
  const { trend, isHeuristic } = computeToneTrend(windowed);

  return {
    nightsWorkedPastThreshold: countNightsWorkedPastThreshold(windowed),
    longestNoBreakStreakHours: Math.round(streak.longestStreakHours * 10) / 10,
    toneTrend: trend,
    toneIsHeuristic: isHeuristic,
    weekStart,
    weekEnd,
  };
}
