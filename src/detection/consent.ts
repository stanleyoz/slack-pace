import { CheckInFrequency, ConsentState } from "../types";

/**
 * In-memory opt-in store. Every path that would send a nudge or digest must
 * check isOptedIn() first — this is enforced inside the MCP send_private_nudge
 * tool itself (src/mcp/tools/sendPrivateNudge.ts), not just the Bolt layer,
 * so the consent gate can't be bypassed by any MCP client.
 */
class ConsentStore {
  private state: Map<string, ConsentState> = new Map();

  optIn(userId: string): ConsentState {
    const next: ConsentState = {
      optedIn: true,
      optedInAt: Date.now(),
      checkInFrequency: this.state.get(userId)?.checkInFrequency ?? "weekly",
    };
    this.state.set(userId, next);
    return next;
  }

  optOut(userId: string): ConsentState {
    const next: ConsentState = {
      optedIn: false,
      checkInFrequency: "off",
    };
    this.state.set(userId, next);
    return next;
  }

  setCheckInFrequency(userId: string, frequency: CheckInFrequency): ConsentState {
    const current = this.get(userId);
    const next: ConsentState = { ...current, checkInFrequency: frequency };
    this.state.set(userId, next);
    return next;
  }

  get(userId: string): ConsentState {
    return (
      this.state.get(userId) ?? {
        optedIn: false,
        checkInFrequency: "off",
      }
    );
  }

  isOptedIn(userId: string): boolean {
    return this.get(userId).optedIn;
  }
}

export const consentStore = new ConsentStore();
