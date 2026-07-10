import { describe, it, expect } from "vitest";
import { detectBurst } from "../src/detection/burstDetector";
import { generateBurstEvents } from "../src/seed/seedEvents";
import { ActivityEvent } from "../src/types";

describe("detectBurst", () => {
  it("detects a burst from seeded high-velocity events", () => {
    const now = Date.now();
    const events = generateBurstEvents("U1", { endTs: now });

    const result = detectBurst(events, now);

    expect(result).not.toBeNull();
    expect(result!.messageCount + result!.prCount).toBeGreaterThanOrEqual(10);
    expect(result!.maxGapMinutes).toBeLessThanOrEqual(4);
  });

  it("does not trigger for normal, sparse pace", () => {
    const now = Date.now();
    const events: ActivityEvent[] = [];
    // 5 messages, one every 40 minutes — well under the burst threshold
    for (let i = 0; i < 5; i++) {
      events.push({ userId: "U1", type: "message", ts: now - i * 40 * 60_000 });
    }

    const result = detectBurst(events, now);

    expect(result).toBeNull();
  });

  it("does not trigger when events exist but gaps are too large", () => {
    const now = Date.now();
    const events: ActivityEvent[] = [];
    // 12 messages spread over 3 hours but with ~15 min gaps (> maxGapMinutes)
    for (let i = 0; i < 12; i++) {
      events.push({ userId: "U1", type: "message", ts: now - i * 15 * 60_000 });
    }

    const result = detectBurst(events, now);

    expect(result).toBeNull();
  });
});
