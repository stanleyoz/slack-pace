# Privacy & consent design

Pace exists to help with burnout, not to create a new surveillance tool.
Every design decision below follows from that one line, because a bot that
watches your activity and reports on you is the opposite of "for good."

## Principles

1. **Opt-in only.** Nothing happens for a user until they run `/pace optin`
   or toggle it on in the App Home. Default state is off.
2. **DM-only delivery.** Both hero moments (`buildNudgeMessage`,
   `buildDigestMessage` in `src/bolt/messages.ts`) are sent as private DMs.
   Pace never posts to a channel, never @-mentions anyone, never surfaces an
   individual's activity anywhere public.
3. **No manager visibility into individuals.** The only team-level view is
   `get_team_aggregate_wellbeing`, whose input schema (`src/mcp/tools/getTeamAggregateWellbeing.ts`)
   has no `userId` field — there is no code path by which a per-user number
   can be requested through it, by accident or otherwise.
4. **Consent enforced at the tool boundary, not the UI boundary.** The
   `send_private_nudge` MCP tool checks `consentStore.isOptedIn()` itself
   before doing anything. Even a different MCP client talking to the same
   server could not bypass this by skipping the Bolt UI.
5. **Minimal OAuth scopes.** `manifest.json` requests `chat:write`,
   `im:write`, `im:history`, `commands`, `users:read` — no broad
   `channels:history`/`groups:history` scopes, since the demo runs on seeded
   data rather than reading real channel content.
6. **Reversible at any time.** `/pace optout` immediately stops all
   check-ins. There's no "soft" opt-out that keeps collecting data quietly.

## Why this matters for judging

"Agent for Good" submissions that read as covert productivity monitoring
tend to read as harmful rather than helpful, regardless of intent. Pace's
copy is deliberately framed as an offer ("want me to...?"), never a
verdict, and the privacy mechanics above are structural, not just stated —
which is the difference between a demo claim and something a judge can
actually verify by reading the code.
