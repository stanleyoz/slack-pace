import { App } from "@slack/bolt";
import { consentStore } from "../detection/consent";
import { memoryStore } from "../store/memoryStore";

const ADJUST_SCHEDULE_MODAL_CALLBACK_ID = "pace_adjust_schedule_modal";

const PLACEHOLDER_RESOURCE_TEXT =
  "Here's a placeholder resource link — in a real deployment this would point to your org's actual EAP/wellbeing resources: https://example.com/wellbeing-resources";

export function registerActionHandlers(app: App): void {
  // --- Concept A nudge buttons ---

  app.action("nudge_dismiss", async ({ ack, body, client }) => {
    await ack();
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? (body as any).user.id,
      user: (body as any).user.id,
      text: "Got it — no action taken. I'll keep an eye out quietly.",
    });
  });

  app.action("nudge_remind_30", async ({ ack, body, client }) => {
    await ack();
    // Hackathon scope: acknowledges and logs the commitment rather than
    // wiring a real 30-minute scheduled re-send (Slack chat.scheduleMessage
    // would be the production path).
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? (body as any).user.id,
      user: (body as any).user.id,
      text: "Okay, I'll check back in with you in 30 minutes.",
    });
  });

  app.action("nudge_block_walk", async ({ ack, body, client }) => {
    await ack();
    const userId = (body as any).user.id;
    memoryStore.setLastNudgeSentAt(userId, Date.now()); // resets cooldown as a courtesy
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? userId,
      user: userId,
      text: "Noted — I've logged a 9-10am walk block for tomorrow. (Calendar integration is simulated for this demo.)",
    });
  });

  // --- Concept C digest buttons ---

  app.action("digest_adjust_schedule", async ({ ack, body, client }) => {
    await ack();
    const triggerId = (body as any).trigger_id;
    await client.views.open({
      trigger_id: triggerId,
      view: {
        type: "modal",
        callback_id: ADJUST_SCHEDULE_MODAL_CALLBACK_ID,
        title: { type: "plain_text", text: "Check-in schedule" },
        submit: { type: "plain_text", text: "Save" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "input",
            block_id: "frequency_block",
            label: { type: "plain_text", text: "How often should Pace check in?" },
            element: {
              type: "static_select",
              action_id: "frequency_select",
              options: [
                { text: { type: "plain_text", text: "Weekly" }, value: "weekly" },
                { text: { type: "plain_text", text: "Off" }, value: "off" },
              ],
            },
          },
        ],
      },
    });
  });

  app.view(ADJUST_SCHEDULE_MODAL_CALLBACK_ID, async ({ ack, body, view }) => {
    await ack();
    const userId = body.user.id;
    const selected =
      view.state.values.frequency_block?.frequency_select?.selected_option?.value ?? "weekly";
    consentStore.setCheckInFrequency(userId, selected as "weekly" | "off");
  });

  app.action("digest_talk_to_someone", async ({ ack, body, client }) => {
    await ack();
    const userId = (body as any).user.id;
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? userId,
      user: userId,
      text: PLACEHOLDER_RESOURCE_TEXT,
    });
  });

  app.action("digest_useful", async ({ ack, body, client }) => {
    await ack();
    const userId = (body as any).user.id;
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? userId,
      user: userId,
      text: "Thanks — that feedback helps me tune future check-ins.",
    });
  });
}
