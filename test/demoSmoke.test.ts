import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WebClient } from "@slack/web-api";
import { PaceMcpClient } from "../src/mcp/client";
import { memoryStore } from "../src/store/memoryStore";
import { consentStore } from "../src/detection/consent";
import { generateBurstEvents } from "../src/seed/seedEvents";
import { generateWeekEvents } from "../src/seed/seedWeek";
import { computeWeeklyDigest } from "../src/detection/weeklyDigest";

function makeFakeWebClient() {
  const postMessage = vi.fn().mockResolvedValue({ ok: true, ts: "1234.5678" });
  const conversationsOpen = vi.fn().mockResolvedValue({ ok: true, channel: { id: "D_FAKE" } });

  const webClient = {
    conversations: { open: conversationsOpen },
    chat: { postMessage },
  } as unknown as WebClient;

  return { webClient, postMessage, conversationsOpen };
}

describe("demo smoke: burst nudge (Concept A)", () => {
  const userId = "U_DEMO_BURST";

  beforeEach(() => {
    memoryStore.clearEvents(userId);
    memoryStore.setLastNudgeSentAt(userId, 0);
    consentStore.optIn(userId);
  });

  it("seeds a burst, calls send_private_nudge, and posts the locked hero-moment copy", async () => {
    const { webClient, postMessage, conversationsOpen } = makeFakeWebClient();
    const mcpClient = new PaceMcpClient(webClient);

    memoryStore.addEvents(userId, generateBurstEvents(userId));

    const pattern = (await mcpClient.getUserActivityPattern(userId)) as { burst: unknown };
    expect(pattern.burst).not.toBeNull();

    const result = await mcpClient.sendPrivateNudge(userId, "burst_nudge", pattern.burst as object);

    expect(result.ok).toBe(true);
    expect(conversationsOpen).toHaveBeenCalledWith({ users: userId });
    expect(postMessage).toHaveBeenCalledTimes(1);

    const [call] = postMessage.mock.calls;
    const payload = call[0] as { text: string; blocks: unknown[] };

    expect(payload.text).toContain("That's not how humans code, that's how I code.");
    const actionIds = JSON.stringify(payload.blocks);
    expect(actionIds).toContain("nudge_dismiss");
    expect(actionIds).toContain("nudge_remind_30");
    expect(actionIds).toContain("nudge_block_walk");
  });

  it("does not send duplicate nudges when two calls race concurrently", async () => {
    // Regression test: found live when a user sent several DMs in quick
    // succession — each message independently triggered a burst check,
    // and the cooldown used to be recorded only after two awaited Slack
    // calls, leaving a window where both calls could pass the cooldown
    // check before either had recorded a timestamp.
    const { webClient, postMessage } = makeFakeWebClient();
    const mcpClient = new PaceMcpClient(webClient);

    memoryStore.addEvents(userId, generateBurstEvents(userId));
    const pattern = (await mcpClient.getUserActivityPattern(userId)) as { burst: unknown };

    const [first, second] = await Promise.all([
      mcpClient.sendPrivateNudge(userId, "burst_nudge", pattern.burst as object),
      mcpClient.sendPrivateNudge(userId, "burst_nudge", pattern.burst as object),
    ]);

    const results = [first, second];
    const sent = results.filter((r) => r.ok);
    const skipped = results.filter((r) => !r.ok);

    expect(sent).toHaveLength(1);
    expect(skipped).toHaveLength(1);
    expect(postMessage).toHaveBeenCalledTimes(1);
  });

  it("skips sending if the user has not opted in", async () => {
    consentStore.optOut(userId);
    const { webClient, postMessage } = makeFakeWebClient();
    const mcpClient = new PaceMcpClient(webClient);

    memoryStore.addEvents(userId, generateBurstEvents(userId));
    const pattern = (await mcpClient.getUserActivityPattern(userId)) as { burst: unknown };
    const result = await mcpClient.sendPrivateNudge(userId, "burst_nudge", pattern.burst as object);

    expect(result.ok).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe("demo smoke: weekly digest (Concept C)", () => {
  const userId = "U_DEMO_DIGEST";

  beforeEach(() => {
    memoryStore.clearEvents(userId);
    consentStore.optIn(userId);
  });

  it("seeds a week, calls send_private_nudge, and posts the locked closer copy", async () => {
    const { webClient, postMessage } = makeFakeWebClient();
    const mcpClient = new PaceMcpClient(webClient);

    const now = Date.now();
    const weekStart = now - 7 * 24 * 3_600_000;
    memoryStore.addEvents(userId, generateWeekEvents(userId, { endTs: now }));
    const digest = computeWeeklyDigest(memoryStore.getEvents(userId), weekStart, now);

    const result = await mcpClient.sendPrivateNudge(userId, "weekly_digest", digest as unknown as object);

    expect(result.ok).toBe(true);
    expect(postMessage).toHaveBeenCalledTimes(1);

    const [call] = postMessage.mock.calls;
    const payload = call[0] as { text: string; blocks: unknown[] };
    const actionIds = JSON.stringify(payload.blocks);

    expect(payload.text).toContain("This week:");
    expect(actionIds).toContain("digest_adjust_schedule");
    expect(actionIds).toContain("digest_talk_to_someone");
    expect(actionIds).toContain("digest_useful");
  });
});
