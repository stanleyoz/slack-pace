import { KnownBlock } from "@slack/types";
import { BurstResult, WeeklyDigestResult } from "../types";

const PRIVACY_CONTEXT: KnownBlock = {
  type: "context",
  elements: [
    {
      type: "mrkdwn",
      text: "🔒 Only visible to you. Pace never posts your activity publicly or to your manager.",
    },
  ],
};

export interface BuiltMessage {
  text: string; // fallback text for notifications
  blocks: KnownBlock[];
}

/** Concept A — the primary hero moment. */
export function buildNudgeMessage(burst: BurstResult): BuiltMessage {
  const { messageCount, prCount, maxGapMinutes } = burst;
  const headline = `You've sent ${messageCount} messages and ${prCount} PRs in the last 3 hours, back to back, no gap over ${maxGapMinutes} min.`;
  const body = "That's not how humans code, that's how I code. Not judging the output — just flagging the pace.";

  return {
    text: `${headline} ${body}`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${headline}*\n${body}` },
      },
      PRIVACY_CONTEXT,
      {
        type: "actions",
        block_id: "pace_nudge_actions",
        elements: [
          {
            type: "button",
            action_id: "nudge_dismiss",
            text: { type: "plain_text", text: "Nothing, I'm good" },
          },
          {
            type: "button",
            action_id: "nudge_remind_30",
            text: { type: "plain_text", text: "Remind me in 30 min" },
          },
          {
            type: "button",
            action_id: "nudge_block_walk",
            text: { type: "plain_text", text: "Block tomorrow 9-10am for a walk" },
            style: "primary",
          },
        ],
      },
    ],
  };
}

/** Concept C — the reflective weekly closer. */
export function buildDigestMessage(digest: WeeklyDigestResult): BuiltMessage {
  const { nightsWorkedPastThreshold, longestNoBreakStreakHours, toneTrend } = digest;

  const toneLine =
    toneTrend === "worsening"
      ? "message tone trending terser this week"
      : toneTrend === "improving"
      ? "message tone trending more relaxed this week"
      : "message tone steady this week";

  const summary = `This week: ${nightsWorkedPastThreshold} night${
    nightsWorkedPastThreshold === 1 ? "" : "s"
  } past 9pm, ${longestNoBreakStreakHours}h longest stretch without a break, ${toneLine}.`;

  return {
    text: summary,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "Your week, at a glance" },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: summary },
      },
      PRIVACY_CONTEXT,
      {
        type: "actions",
        block_id: "pace_digest_actions",
        elements: [
          {
            type: "button",
            action_id: "digest_adjust_schedule",
            text: { type: "plain_text", text: "Adjust my check-in schedule" },
          },
          {
            type: "button",
            action_id: "digest_talk_to_someone",
            text: { type: "plain_text", text: "Talk to someone" },
          },
          {
            type: "button",
            action_id: "digest_useful",
            text: { type: "plain_text", text: "This was useful" },
            style: "primary",
          },
        ],
      },
    ],
  };
}
