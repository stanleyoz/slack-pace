import { describe, it, expect } from "vitest";
import { mapPullRequestsToEvents } from "../src/github/githubActivity";
import { RawPullRequest } from "../src/github/githubClient";
import { detectBurst } from "../src/detection/burstDetector";

function makePr(i: number, createdAt: string): RawPullRequest {
  return {
    number: i,
    title: `demo PR #${i}`,
    url: `https://github.com/stanleyoz/slack-pace/pull/${i}`,
    createdAt,
    updatedAt: createdAt,
  };
}

describe("mapPullRequestsToEvents", () => {
  it("maps raw PRs to pr-type ActivityEvents for the given Slack user", () => {
    const prs = [makePr(1, "2026-07-10T10:00:00Z"), makePr(2, "2026-07-10T10:05:00Z")];

    const events = mapPullRequestsToEvents(prs, "U123");

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ userId: "U123", type: "pr" });
    expect(events[0].ts).toBe(new Date("2026-07-10T10:00:00Z").getTime());
  });

  it("feeds detectBurst() identically to any other ActivityEvent source", () => {
    const now = Date.now();
    // 12 PRs, 2 minutes apart, well within the 3hr window and under the 4min gap threshold
    const prs = Array.from({ length: 12 }, (_, i) =>
      makePr(i + 1, new Date(now - (11 - i) * 2 * 60_000).toISOString())
    );

    const events = mapPullRequestsToEvents(prs, "U123");
    const burst = detectBurst(events, now);

    expect(burst).not.toBeNull();
    expect(burst!.prCount).toBe(12);
    expect(burst!.messageCount).toBe(0);
  });
});
