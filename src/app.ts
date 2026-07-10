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

// Passive activity capture from real DM traffic, feeding Concept A/C
// detection. Seed scripts (src/seed/*) are the primary/reliable path for
// demo recording; this listener lets the bot also react to genuine usage.
app.message(async ({ message }) => {
  if (message.subtype || !("user" in message) || !message.user) return;
  memoryStore.addEvents(message.user, [
    { userId: message.user, type: "message", ts: Number(message.ts) * 1000, text: "text" in message ? message.text : undefined },
  ]);
});

(async () => {
  await app.start();
  console.log("⚡️ Pace is running (Socket Mode).");
})();
