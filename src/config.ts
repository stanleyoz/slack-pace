import * as dotenv from "dotenv";

dotenv.config();

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  slackBotToken: process.env.SLACK_BOT_TOKEN ?? "",
  slackAppToken: process.env.SLACK_APP_TOKEN ?? "",
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET ?? "",
  slackTeamId: process.env.SLACK_TEAM_ID ?? "",

  // Concept A — burst detection thresholds
  minEvents: envInt("PACE_MIN_EVENTS", 10),
  windowMinutes: envInt("PACE_WINDOW_MINUTES", 180),
  maxGapMinutes: envInt("PACE_MAX_GAP_MINUTES", 4),
  nudgeCooldownMinutes: envInt("PACE_NUDGE_COOLDOWN_MINUTES", 240),

  // hours (local) considered "unsociable" — used to soften/adjust copy, not to gate the trigger
  unsociableHours: [22, 23, 0, 1, 2, 3, 4, 5],

  // Concept C — weekly digest thresholds
  nightThresholdHour: 21, // events after this local hour count as "worked late"
  breakGapMinutesThreshold: 90, // gap beyond this counts as a "break" for streak purposes
} as const;
