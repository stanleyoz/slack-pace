import { App, LogLevel } from "@slack/bolt";
import { config } from "./config";
import { registerActionHandlers } from "./bolt/actions";
import { registerCommandHandlers } from "./bolt/commands";
import { registerHomeHandlers } from "./bolt/home";
import { PaceMcpClient } from "./mcp/client";
import { memoryStore } from "./store/memoryStore";

const app = new App({
  token: config.slackBotToken,
  appToken: config.slackAppToken,
  socketMode: true,
  logLevel: LogLevel.INFO,
});

// The MCP client is the seam the rest of the app calls through to reach
// detection/store logic and to act on Slack (send_private_nudge) — see
// src/mcp/client.ts and src/mcp/server.ts.
export const mcpClient = new PaceMcpClient(app.client);

registerActionHandlers(app);
registerCommandHandlers(app);
registerHomeHandlers(app);

// Live activity capture from real DM traffic, feeding Concept A detection
// in real time — this is what lets anyone (including a judge with no
// terminal/GitHub access) self-serve trigger a real nudge just by DMing
// Pace quickly enough, on top of the CLI-driven demo paths in scripts/*.
// Consent and cooldown are enforced inside send_private_nudge itself, so
// this listener doesn't need to duplicate either check.
app.message(async ({ message }) => {
  if (message.subtype || !("user" in message) || !message.user) return;
  const userId = message.user;

  memoryStore.addEvents(userId, [
    { userId, type: "message", ts: Number(message.ts) * 1000, text: "text" in message ? message.text : undefined },
  ]);

  const pattern = await mcpClient.getUserActivityPattern(userId);
  const burst = (pattern as { burst: unknown }).burst;
  if (burst) {
    await mcpClient.sendPrivateNudge(userId, "burst_nudge", burst as object);
  }
});

(async () => {
  await app.start();
  console.log("⚡️ Pace is running (Socket Mode).");
})();
