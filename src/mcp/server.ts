import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WebClient } from "@slack/web-api";
import { registerGetUserActivityPattern } from "./tools/getUserActivityPattern";
import { registerSendPrivateNudge } from "./tools/sendPrivateNudge";
import { registerGetTeamAggregateWellbeing } from "./tools/getTeamAggregateWellbeing";

export function createPaceMcpServer(webClient: WebClient): McpServer {
  const server = new McpServer({
    name: "pace-mcp-server",
    version: "0.1.0",
  });

  registerGetUserActivityPattern(server);
  registerSendPrivateNudge(server, { webClient });
  registerGetTeamAggregateWellbeing(server);

  return server;
}
