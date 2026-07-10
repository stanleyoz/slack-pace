import { WebClient } from "@slack/web-api";
import { config } from "../src/config";
import { memoryStore } from "../src/store/memoryStore";
import { consentStore } from "../src/detection/consent";
import { generateWeekEvents } from "../src/seed/seedWeek";
import { computeWeeklyDigest } from "../src/detection/weeklyDigest";
import { PaceMcpClient } from "../src/mcp/client";

/**
 * Reliable, repeatable trigger for the Concept C hero moment (weekly
 * digest closer) — seeds a synthetic week and fires the real DM into the
 * sandbox workspace via the MCP send_private_nudge tool.
 *
 * Usage: npm run demo:digest -- --user U0123ABC
 */
async function main() {
  const userIdArg = process.argv.find((a) => a.startsWith("--user="))?.split("=")[1];
  const userId = userIdArg ?? process.env.PACE_DEMO_USER_ID;

  if (!userId) {
    console.error("Usage: npm run demo:digest -- --user=<slack-user-id> (or set PACE_DEMO_USER_ID)");
    process.exit(1);
  }
  if (!config.slackBotToken) {
    console.error("SLACK_BOT_TOKEN is not set — copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const webClient = new WebClient(config.slackBotToken);
  const mcpClient = new PaceMcpClient(webClient);

  const now = Date.now();
  const weekStart = now - 7 * 24 * 3_600_000;

  memoryStore.clearEvents(userId);
  consentStore.optIn(userId);
  memoryStore.addEvents(userId, generateWeekEvents(userId, { endTs: now }));

  const digest = computeWeeklyDigest(memoryStore.getEvents(userId), weekStart, now);

  const result = await mcpClient.sendPrivateNudge(userId, "weekly_digest", digest as unknown as object);
  console.log("Weekly digest sent:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
