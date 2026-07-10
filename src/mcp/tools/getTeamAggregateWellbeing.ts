import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { memoryStore } from "../../store/memoryStore";
import { consentStore } from "../../detection/consent";
import { computeWeeklyDigest } from "../../detection/weeklyDigest";

export const getTeamAggregateWellbeingInput = {
  teamId: z.string(),
};

/**
 * Aggregate-only, opted-in-users-only. Deliberately has no userId filter
 * parameter — per-user data cannot be requested through this tool even by
 * accident, which is the privacy guarantee enforced by construction rather
 * than by policy alone.
 */
export function registerGetTeamAggregateWellbeing(server: McpServer): void {
  server.registerTool(
    "get_team_aggregate_wellbeing",
    {
      description:
        "Returns anonymized, aggregate wellbeing stats across opted-in users only. No per-user breakdown is available through this tool.",
      inputSchema: getTeamAggregateWellbeingInput,
    },
    async () => {
      const now = Date.now();
      const weekStart = now - 7 * 24 * 3_600_000;

      const optedInUserIds = memoryStore
        .getAllUserIds()
        .filter((userId) => consentStore.isOptedIn(userId));

      if (optedInUserIds.length === 0) {
        return {
          content: [{ type: "text", text: "No opted-in users yet." }],
          structuredContent: {
            optedInCount: 0,
            avgNightsWorkedPastThreshold: 0,
            avgLongestNoBreakStreakHours: 0,
          },
        };
      }

      const digests = optedInUserIds.map((userId) =>
        computeWeeklyDigest(memoryStore.getEvents(userId), weekStart, now)
      );

      const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;

      const result = {
        optedInCount: optedInUserIds.length,
        avgNightsWorkedPastThreshold:
          Math.round(avg(digests.map((d) => d.nightsWorkedPastThreshold)) * 10) / 10,
        avgLongestNoBreakStreakHours:
          Math.round(avg(digests.map((d) => d.longestNoBreakStreakHours)) * 10) / 10,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );
}
