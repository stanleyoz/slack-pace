import { ActivityEvent } from "../types";

/**
 * In-memory event + cooldown store for the hackathon build. Swap for a real
 * database (e.g. DynamoDB/Postgres) for a production deployment — the
 * interface below is the seam to replace.
 */
class MemoryStore {
  private events: Map<string, ActivityEvent[]> = new Map();
  private lastNudgeSentAt: Map<string, number> = new Map();

  addEvents(userId: string, newEvents: ActivityEvent[]): void {
    const existing = this.events.get(userId) ?? [];
    this.events.set(userId, [...existing, ...newEvents]);
  }

  getEvents(userId: string): ActivityEvent[] {
    return this.events.get(userId) ?? [];
  }

  clearEvents(userId: string): void {
    this.events.delete(userId);
  }

  getAllUserIds(): string[] {
    return [...this.events.keys()];
  }

  setLastNudgeSentAt(userId: string, ts: number): void {
    this.lastNudgeSentAt.set(userId, ts);
  }

  getLastNudgeSentAt(userId: string): number | undefined {
    return this.lastNudgeSentAt.get(userId);
  }
}

export const memoryStore = new MemoryStore();
