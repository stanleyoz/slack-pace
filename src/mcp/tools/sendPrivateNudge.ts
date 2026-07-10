import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WebClient } from "@slack/web-api";
import { consentStore } from "../../detection/consent";
import { memoryStore } from "../../store/memoryStore";
import { buildNudgeMessage, buildDigestMessage } from "../../bolt/messages";
import { BurstResult, WeeklyDigestResult, NudgeTemplate } from "../../types";
import { config } from "../../config";

export const sendPrivateNudgeInput = {
  userId: z.string(),
  template: z.enum(["burst_nudge", "weekly_digest"]),
  context: z.record(z.string(), z.any()),
};

interface SendPrivateNudgeDeps {
  webClient: WebClient;
}

/**
 * The tool that actually acts on Slack. Enforces the consent gate and the
 * per-user nudge cooldown internally, so no MCP client — Bolt app or
 * otherwise — can bypass them by calling this tool directly.
 */
export function registerSendPrivateNudge(server: McpServer, deps: SendPrivateNudgeDeps): void {
  server.registerTool(
    "send_private_nudge",
    {
      description:
        "Sends a private DM nudge (burst_nudge or weekly_digest) to a user, subject to their consent and cooldown settings.",
      inputSchema: sendPrivateNudgeInput,
    },
    async ({ userId, template, context }) => {
      if (!consentStore.isOptedIn(userId)) {
        return {
          content: [
            { type: "text", text: `Skipped: user ${userId} has not opted in to Pace.` },
          ],
          structuredContent: { ok: false, reason: "not_opted_in" },
        };
      }

      if (template === "burst_nudge") {
        const lastSent = memoryStore.getLastNudgeSentAt(userId);
        const cooldownMs = config.nudgeCooldownMinutes * 60_000;
        if (lastSent && Date.now() - lastSent < cooldownMs) {
          return {
            content: [
              { type: "text", text: `Skipped: user ${userId} is within the nudge cooldown window.` },
            ],
            structuredContent: { ok: false, reason: "cooldown" },
          };
        }
        // Claim the cooldown slot immediately, before the awaited Slack
        // calls below — otherwise two burst_nudge calls arriving close
        // together (e.g. a live user sending several quick messages) can
        // both pass the check above before either has recorded a
        // timestamp, producing duplicate nudges. This makes the window
        // effectively zero instead of spanning two network round-trips.
        memoryStore.setLastNudgeSentAt(userId, Date.now());
      }

      const built =
        template === "burst_nudge"
          ? buildNudgeMessage(context as unknown as BurstResult)
          : buildDigestMessage(context as unknown as WeeklyDigestResult);

      const dm = await deps.webClient.conversations.open({ users: userId });
      const channelId = dm.channel?.id;
      if (!channelId) {
        return {
          content: [{ type: "text", text: `Failed to open DM with user ${userId}.` }],
          structuredContent: { ok: false, reason: "dm_open_failed" },
        };
      }

      const result = await deps.webClient.chat.postMessage({
        channel: channelId,
        text: built.text,
        blocks: built.blocks,
      });

      return {
        content: [{ type: "text", text: `Sent ${template} nudge to ${userId}.` }],
        structuredContent: { ok: true, channelId, ts: result.ts },
      };
    }
  );
}

export type { NudgeTemplate };
