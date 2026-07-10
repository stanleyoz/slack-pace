import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { memoryStore } from "../../store/memoryStore";
import { detectBurst } from "../../detection/burstDetector";

export const getUserActivityPatternInput = {
  userId: z.string(),
  windowMinutes: z.number().optional(),
};

export function registerGetUserActivityPattern(server: McpServer): void {
  server.registerTool(
    "get_user_activity_pattern",
    {
      description:
        "Returns a user's recent activity events and whether a high-velocity burst (Concept A) is currently detected.",
      inputSchema: getUserActivityPatternInput,
    },
    async ({ userId }) => {
      const events = memoryStore.getEvents(userId);
      const burst = detectBurst(events, Date.now());

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ events, burst }, null, 2),
          },
        ],
        structuredContent: { events, burst },
      };
    }
  );
}
