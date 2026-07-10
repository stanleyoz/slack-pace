import { WebClient } from "@slack/web-api";
import { config } from "../src/config";
import { memoryStore } from "../src/store/memoryStore";
import { consentStore } from "../src/detection/consent";
import { fetchGithubActivityEvents } from "../src/github/githubActivity";
import { PaceMcpClient } from "../src/mcp/client";

/**
 * Reads real PR activity from GitHub (via the gh CLI) and, if it forms a
 * genuine burst, fires the real send_private_nudge MCP tool — the same
 * path as scripts/trigger-burst-demo.ts, but sourced from live GitHub data
 * instead of seed/seedEvents.ts. Uses the same detectBurst() as everywhere
 * else in the codebase, so this is provably not a separate/fake code path.
 *
 * Usage:
 *   npm run demo:poll-github -- --user=U0123ABC
 *   npm run demo:poll-github -- --user=U0123ABC --watch   (poll every 30s)
 */
async function checkOnce(mcpClient: PaceMcpClient, userId: string): Promise<boolean> {
  if (!config.githubRepo || !config.githubUsername) {
    console.error("Set GITHUB_REPO and GITHUB_USERNAME in .env first.");
    process.exit(1);
  }

  const events = await fetchGithubActivityEvents({
    repo: config.githubRepo,
    githubUsername: config.githubUsername,
    slackUserId: userId,
    sinceMinutes: config.windowMinutes,
  });

  memoryStore.clearEvents(userId);
  memoryStore.addEvents(userId, events);

  console.log(`Fetched ${events.length} real PR events from ${config.githubRepo} in the last ${config.windowMinutes}m.`);

  const pattern = await mcpClient.getUserActivityPattern(userId);
  const burst = (pattern as { burst: unknown }).burst;

  if (!burst) {
    console.log("No burst detected yet.");
    return false;
  }

  const result = await mcpClient.sendPrivateNudge(userId, "burst_nudge", burst as object);
  console.log("Real burst detected from GitHub activity — nudge result:", result);
  return true;
}

async function main() {
  const userIdArg = process.argv.find((a) => a.startsWith("--user="))?.split("=")[1];
  const userId = userIdArg ?? config.demoUserId;
  const watch = process.argv.includes("--watch");

  if (!userId) {
    console.error("Usage: npm run demo:poll-github -- --user=<slack-user-id> (or set PACE_DEMO_USER_ID)");
    process.exit(1);
  }
  if (!config.slackBotToken) {
    console.error("SLACK_BOT_TOKEN is not set — copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const webClient = new WebClient(config.slackBotToken);
  const mcpClient = new PaceMcpClient(webClient);

  consentStore.optIn(userId); // demo convenience; in real usage the user opts in via /pace optin

  if (!watch) {
    await checkOnce(mcpClient, userId);
    return;
  }

  console.log("Watching for a real GitHub PR burst every 30s (Ctrl+C to stop)...");
  const intervalMs = 30_000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const fired = await checkOnce(mcpClient, userId);
    if (fired) {
      console.log("Nudge sent — stopping watch (cooldown will prevent immediate re-fires anyway).");
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
