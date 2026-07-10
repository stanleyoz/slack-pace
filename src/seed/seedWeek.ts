import { ActivityEvent } from "../types";

export interface WeekSeedOptions {
  nightsPastThreshold?: number;
  longestNoBreakHours?: number;
  endTs?: number;
  worseningTone?: boolean;
}

const DAY_MS = 24 * 3_600_000;
const HOUR_MS = 3_600_000;

/**
 * Generates a synthetic 7-day event set tuned to produce specific,
 * demo-friendly weekly digest numbers (Concept C), ending at `now`.
 */
export function generateWeekEvents(
  userId: string,
  opts: WeekSeedOptions = {}
): ActivityEvent[] {
  const {
    nightsPastThreshold = 4,
    longestNoBreakHours = 6.5,
    endTs = Date.now(),
    worseningTone = true,
  } = opts;

  // Snap to the most recent UTC midnight before (endTs - 7 days) so the
  // hour offsets below (+9h, +22h, ...) land on deterministic UTC hours
  // regardless of what wall-clock moment `endTs` happens to be.
  const rawWeekStart = endTs - 7 * DAY_MS;
  const weekStart = rawWeekStart - (rawWeekStart % DAY_MS);
  const events: ActivityEvent[] = [];

  // Normal daytime activity across the week, terseness increasing later
  // in the week if worseningTone is set (heuristic tone-trend input).
  const longTexts = [
    "Here's the full writeup with context on why we chose this approach.",
    "I think we should discuss this further before merging, lots to consider.",
    "Sharing the doc, happy to walk through it whenever works for you.",
  ];
  const terseTexts = ["ok", "done", "k", "sure", "fine"];

  for (let day = 0; day < 7; day++) {
    const dayStart = weekStart + day * DAY_MS;
    const useTerse = worseningTone && day >= 4;
    for (let i = 0; i < 6; i++) {
      const ts = dayStart + 9 * HOUR_MS + i * 45 * 60_000; // spread through the day
      const text = useTerse
        ? terseTexts[i % terseTexts.length]
        : longTexts[i % longTexts.length];
      events.push({ userId, type: "message", ts, text });
    }
  }

  // Late-night events on `nightsPastThreshold` distinct days (after 21:00 local).
  for (let n = 0; n < nightsPastThreshold; n++) {
    const dayStart = weekStart + (n + 1) * DAY_MS;
    const ts = dayStart + 22 * HOUR_MS; // 22:00
    events.push({ userId, type: "message", ts, text: "still here" });
  }

  // A dense no-break streak of longestNoBreakHours on one day, gaps under
  // the break threshold so findLongestStreak reports it correctly.
  const streakDay = weekStart + 2 * DAY_MS;
  const streakStart = streakDay + 8 * HOUR_MS;
  const stepMinutes = 60; // well under breakGapMinutesThreshold (90m)
  const steps = Math.round((longestNoBreakHours * 60) / stepMinutes);
  for (let i = 0; i <= steps; i++) {
    events.push({
      userId,
      type: "message",
      ts: streakStart + i * stepMinutes * 60_000,
      text: "heads down",
    });
  }

  return events.sort((a, b) => a.ts - b.ts);
}
