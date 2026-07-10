import { WebClient } from "@slack/web-api";
import { config } from "../src/config";
import { memoryStore } from "../src/store/memoryStore";
import { consentStore } from "../src/detection/consent";
import { generateBurstEvents } from "../src/seed/seedEvents";
import { PaceMcpClient } from "../src/mcp/client";

/**
 * Reliable, repeatable trigger for the Concept A hero moment — seeds a
 * synthetic burst ending "now" and fires the real DM into the sandbox
 * workspace via the MCP send_private_nudge tool.
 *
 * Usage: npm run demo:burst -- --user U0123ABC
 */
async function main() {
  const userIdArg = process.argv.find((a) => a.startsWith("--user="))?.split("=")[1];
  const userId = userIdArg ?? process.env.PACE_DEMO_USER_ID;

  if (!userId) {
    console.error("Usage: npm run demo:burst -- --user=<slack-user-id> (or set PACE_DEMO_USER_ID)");
    process.exit(1);
  }
  if (!config.slackBotToken) {
    console.error("SLACK_BOT_TOKEN is not set — copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const webClient = new WebClient(config.slackBotToken);
  const mcpClient = new PaceMcpClient(webClient);

  memoryStore.clearEvents(userId);
  memoryStore.setLastNudgeSentAt(userId, 0); // clear cooldown so re-runs work during rehearsal
  consentStore.optIn(userId);
  memoryStore.addEvents(userId, generateBurstEvents(userId));

  const pattern = await mcpClient.getUserActivityPattern(userId);
  const burst = (pattern as { burst: unknown }).burst;

  if (!burst) {
    console.error("Seeded events did not trigger a burst — check detection thresholds in src/config.ts.");
    process.exit(1);
  }

  const result = await mcpClient.sendPrivateNudge(userId, "burst_nudge", burst as object);
  console.log("Burst nudge sent:", result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
