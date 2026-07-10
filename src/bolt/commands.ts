import { App } from "@slack/bolt";
import { consentStore } from "../detection/consent";

export function registerCommandHandlers(app: App): void {
  app.command("/pace", async ({ ack, command, respond }) => {
    await ack();
    const userId = command.user_id;
    const [sub] = command.text.trim().split(/\s+/);

    switch (sub) {
      case "optin": {
        consentStore.optIn(userId);
        await respond({
          response_type: "ephemeral",
          text: "You're opted in. Pace will check in privately — never publicly, never to your manager.",
        });
        break;
      }
      case "optout": {
        consentStore.optOut(userId);
        await respond({
          response_type: "ephemeral",
          text: "You're opted out. Pace won't check in with you until you run `/pace optin` again.",
        });
        break;
      }
      case "status": {
        const state = consentStore.get(userId);
        await respond({
          response_type: "ephemeral",
          text: state.optedIn
            ? `You're opted in (check-ins: ${state.checkInFrequency}).`
            : "You're currently opted out.",
        });
        break;
      }
      default: {
        await respond({
          response_type: "ephemeral",
          text: "Usage: `/pace optin` | `/pace optout` | `/pace status`",
        });
      }
    }
  });
}
