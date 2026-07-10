import { App } from "@slack/bolt";
import { KnownBlock } from "@slack/types";
import { consentStore } from "../detection/consent";

function buildHomeView(userId: string): KnownBlock[] {
  const state = consentStore.get(userId);

  return [
    {
      type: "header",
      text: { type: "plain_text", text: "Pace" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "A caring nudge for people burning out at LLM speed — including the pace of chain-coding with AI tools, not just long hours.",
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Status:* ${state.optedIn ? "✅ Opted in" : "⏸️ Opted out"}${
          state.optedIn ? ` (check-ins: ${state.checkInFrequency})` : ""
        }`,
      },
      accessory: {
        type: "button",
        action_id: "home_toggle_optin",
        text: { type: "plain_text", text: state.optedIn ? "Opt out" : "Opt in" },
        style: state.optedIn ? "danger" : "primary",
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*How Pace protects your privacy:*\n• Opt-in only — nothing happens until you turn it on\n• Every check-in is a private DM to you, never a public post\n• Your manager only ever sees anonymized, aggregate team stats — never your individual data\n• You can opt out at any time with `/pace optout`",
      },
    },
  ];
}

export function registerHomeHandlers(app: App): void {
  app.event("app_home_opened", async ({ event, client }) => {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: buildHomeView(event.user),
      },
    });
  });

  app.action("home_toggle_optin", async ({ ack, body, client }) => {
    await ack();
    const userId = body.user.id;
    const state = consentStore.get(userId);
    if (state.optedIn) {
      consentStore.optOut(userId);
    } else {
      consentStore.optIn(userId);
    }
    await client.views.publish({
      user_id: userId,
      view: {
        type: "home",
        blocks: buildHomeView(userId),
      },
    });
  });
}
