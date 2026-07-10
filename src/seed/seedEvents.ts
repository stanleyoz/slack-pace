import { ActivityEvent } from "../types";

export interface BurstSeedOptions {
  count?: number;
  spanMinutes?: number;
  maxGapMinutes?: number;
  prRatio?: number;
  endTs?: number;
}

/**
 * Generates a synthetic burst of activity ending at `now` (or endTs),
 * evenly spaced within spanMinutes so every gap stays under maxGapMinutes.
 * Deterministic in shape (not wall-clock dependent) so the demo hero
 * moment is reproducible on every run.
 */
export function generateBurstEvents(
  userId: string,
  opts: BurstSeedOptions = {}
): ActivityEvent[] {
  const {
    count = 53,
    spanMinutes = 175,
    maxGapMinutes = 3.5,
    prRatio = 6 / 47,
    endTs = Date.now(),
  } = opts;

  const spanMs = spanMinutes * 60_000;
  const startTs = endTs - spanMs;
  const stepMs = spanMs / (count - 1);

  // guard: keep step under maxGapMinutes so the streak stays contiguous
  const maxGapMs = maxGapMinutes * 60_000;
  const safeStepMs = Math.min(stepMs, maxGapMs * 0.9);

  const events: ActivityEvent[] = [];
  const prCount = Math.max(1, Math.round(count * prRatio));

  for (let i = 0; i < count; i++) {
    const ts = startTs + i * safeStepMs;
    const type = i > 0 && i % Math.round(count / prCount) === 0 ? "pr" : "message";
    events.push({ userId, type, ts, text: type === "message" ? "on it" : undefined });
  }

  return events;
}
