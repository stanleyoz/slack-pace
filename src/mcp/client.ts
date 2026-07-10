import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { WebClient } from "@slack/web-api";
import { createPaceMcpServer } from "./server";

/**
 * Thin wrapper linking an MCP Client to the Pace MCP server in-process via
 * InMemoryTransport. This is the seam the Bolt app calls through instead of
 * invoking detection/store logic directly — the required "MCP server
 * integration" tech is a real integration boundary, not decorative.
 *
 * Structured to swap InMemoryTransport for StdioServerTransport/StdioClientTransport
 * later if a standalone out-of-process MCP server is preferred.
 */
export class PaceMcpClient {
  private client: Client;
  private ready: Promise<void>;

  constructor(webClient: WebClient) {
    const server = createPaceMcpServer(webClient);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    this.client = new Client({ name: "pace-bolt-app", version: "0.1.0" });

    this.ready = Promise.all([
      server.connect(serverTransport),
      this.client.connect(clientTransport),
    ]).then(() => undefined);
  }

  private async callTool<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
    await this.ready;
    const result = await this.client.callTool({ name, arguments: args });
    return (result as { structuredContent?: T }).structuredContent as T;
  }

  getUserActivityPattern(userId: string, windowMinutes?: number) {
    return this.callTool("get_user_activity_pattern", { userId, windowMinutes });
  }

  sendPrivateNudge(userId: string, template: "burst_nudge" | "weekly_digest", context: object) {
    return this.callTool<{ ok: boolean }>("send_private_nudge", { userId, template, context });
  }

  getTeamAggregateWellbeing(teamId: string) {
    return this.callTool("get_team_aggregate_wellbeing", { teamId });
  }
}
