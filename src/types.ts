export type ActivityEventType = "message" | "pr";

export interface ActivityEvent {
  userId: string;
  type: ActivityEventType;
  ts: number; // epoch ms
  channel?: string;
  /** Optional message text, used only by the toneTrend heuristic in weeklyDigest. */
  text?: string;
}

export interface BurstResult {
  messageCount: number;
  prCount: number;
  windowStart: number;
  windowEnd: number;
  maxGapMinutes: number;
  unsociableHoursHit: boolean;
}

export interface StreakResult {
  longestStreakHours: number;
  streakStart: number;
  streakEnd: number;
}

export type ToneTrend = "improving" | "flat" | "worsening";

export interface WeeklyDigestResult {
  nightsWorkedPastThreshold: number;
  longestNoBreakStreakHours: number;
  toneTrend: ToneTrend;
  toneIsHeuristic: boolean;
  weekStart: number;
  weekEnd: number;
}

export type CheckInFrequency = "weekly" | "off";

export interface ConsentState {
  optedIn: boolean;
  optedInAt?: number;
  checkInFrequency: CheckInFrequency;
}

export type NudgeTemplate = "burst_nudge" | "weekly_digest";
