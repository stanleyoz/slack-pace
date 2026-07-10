# Demo video script (target: under 3 minutes)

## Storyboard

**0:00–0:20 — Hook (personal framing)**
> "AI copilots let us work at their pace, not ours. This is Pace — a Slack
> agent that notices when you've started chain-coding at LLM speed, and
> checks in before that becomes a habit."

**0:20–0:35 — Opt-in / App Home**
Show the App Home tab: opt-in toggle, privacy principles list. Click
"Opt in." Say: "Everything here is opt-in and private by design — no
public posts, no manager visibility into individuals."

**0:35–1:15 — Concept A: the burst nudge (hero moment)**
Run in terminal:
```
npm run demo:burst -- --user=<your-user-id>
```
Cut to Slack: the DM arrives. Read the message aloud as it appears:
"You've sent 47 messages and 6 PRs in the last 3 hours, back to back, no
gap over 4 min. That's not how humans code, that's how I code." Click
**Block tomorrow 9–10am for a walk**. Show the ephemeral confirmation.

**1:15–1:35 — Architecture beat**
Briefly show `docs/architecture.md`'s diagram (or narrate over it): "Every
action goes through an MCP server — `get_user_activity_pattern`,
`send_private_nudge`, `get_team_aggregate_wellbeing` — that's the required
MCP integration, and it's also where consent is enforced, not just in the
UI."

**1:35–2:15 — Concept C: the weekly digest (closer)**
Run:
```
npm run demo:digest -- --user=<your-user-id>
```
Cut to Slack: digest DM arrives — nights worked late, longest no-break
streak, tone trend. Click **Adjust my check-in schedule**, show the modal.
Say: "This is the habit-forming close — a private weekly reflection, not
a scorecard."

**2:15–2:40 — Privacy close**
Show `/pace optout` running, confirm check-ins stop immediately. Say:
"Opt-in, DM-only, reversible any time, and the code enforces that —
it's not just a promise in the README."

**2:40–2:55 — Sign-off**
"Pace — built for the Slack Agent for Good track, because the fastest
copilots in the world don't mean we should burn out at their pace."

## Recording checklist

- [ ] Run `npm run demo:burst` and `npm run demo:digest` at least once the
      day before recording to confirm timing and DM rendering.
- [ ] Confirm terminal font/zoom is legible on recording.
- [ ] Record 2+ takes; keep the cleanest.
- [ ] Export/host on YouTube, Vimeo, Facebook Video, or Youku per the
      hackathon rules (no third-party trademarks or copyrighted music).
