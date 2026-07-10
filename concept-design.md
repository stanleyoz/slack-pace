# Pace — Concept & Design

## High-Level Concept

**Pace** is a Slack agent for the "Slack Agent for Good" track that addresses a specific,
underexplored form of burnout: humans entraining to the cadence of high-frequency LLM/AI-assisted
work ("chain-coding" at machine speed) combined with demanding always-on employer expectations.

Rather than a generic wellness bot, Pace watches lightweight activity-pattern signals and
delivers two kinds of caring, private nudges:

- **Concept A — "LLM-pace" burst nudge (primary hero moment):** Detects a high-velocity,
  short-gap streak of messages/PRs and privately flags the pace itself — not the output —
  with actionable buttons (dismiss, snooze, block recovery time).
- **Concept C — Weekly reflective digest (closer):** A private weekly summary of late nights,
  longest no-break streak, and tone trend, with buttons to adjust check-in cadence, request
  help, or confirm usefulness.

Core design principle: **privacy/consent-first by construction** — opt-in only, DMs go to the
user alone, no public posting, no individual-level manager visibility (only anonymized
aggregate team stats if a manager view exists at all). This is what keeps the concept feeling
like a caring nudge rather than a surveillance tool, which matters both ethically and for the
"Potential Impact" / "Idea Quality" judging criteria.

## Architecture

```
Slack Workspace (Events/Interactivity, Socket Mode)
        │
        ▼
  Bolt App (TypeScript, Node)
   ├─ bolt/commands.ts   (/pace optin|optout|status)
   ├─ bolt/home.ts       (App Home opt-in toggle + privacy principles)
   ├─ bolt/actions.ts    (button action_id handlers)
   └─ bolt/messages.ts   (Block Kit builders: nudge + digest)
        │
        ▼  (calls tools via MCP client — the real integration seam)
  MCP Client (src/mcp/client.ts)
        │
        ▼
  MCP Server (src/mcp/server.ts, in-process via InMemoryTransport)
   ├─ get_user_activity_pattern   → wraps detection/burstDetector.ts
   ├─ send_private_nudge          → enforces consent gate, posts via Slack Web API
   └─ get_team_aggregate_wellbeing → aggregate-only, no per-user filter param exists
        │
        ▼
  Detection layer (pure functions, independently testable)
   ├─ detection/burstDetector.ts  (Concept A heuristic)
   ├─ detection/weeklyDigest.ts   (Concept C aggregation)
   ├─ detection/shared.ts         (findLongestStreak, reused by both)
   └─ detection/consent.ts        (opt-in state + guard checks)
        │
        ▼
  Store layer
   └─ store/memoryStore.ts (in-memory event + cooldown store; swappable for a real DB later)
```

**Why MCP is the real integration point, not decorative:** the Bolt app never calls detection
logic directly — every action goes through the MCP client → MCP server → tool boundary. This
makes the required "MCP server integration" technology structurally load-bearing rather than
bolted on for compliance.

**Why consent is enforced at the tool layer:** `send_private_nudge` checks `consentStore.isOptedIn()`
internally, so the gate can't be bypassed by any MCP client — not just the Bolt app — which is
the strongest way to make the privacy claim credible to judges inspecting the code.

**Delivery to users:** end users interact only through native Slack surfaces — DMs, a `/pace`
slash command, and an App Home tab — no separate app or dashboard to install, minimizing
adoption friction, which is itself part of the "for Good" pitch (help has to be reachable to work).

## Evaluation: Will Pace actually help workers in practice?

**User workflow as designed:**
1. Worker opts in via `/pace optin` or App Home toggle — friction is low (native Slack surfaces, no separate insta>
2. Pace passively watches message/PR timestamp patterns.
3. On a detected burst (10+ events, <4min gaps, 3hr window), user gets a private DM naming the pattern, with three>
4. Weekly, a private digest DM summarizes late nights, longest no-break streak, tone trend.
5. `/pace optout` disables it anytime.

**Where this is likely to genuinely help:**
- **Framing is the strongest asset.** "That's not how humans code, that's how I code" names something real and rar>
- **Low adoption friction** (opt-in, native to tools already open) removes the biggest reason wellness tools go un>
- **Privacy-by-construction (no manager visibility, DM-only)** matters practically, not just ethically: a tool emp>

**Where practical benefit is uncertain — worth the user's attention before further build investment:**
- **The nudge has no teeth.** All three response buttons are essentially acknowledgments — "block tomorrow 9-10am >
- **Detection threshold is arbitrary and easily gamed/missed.** 10 events/3hrs/4min gaps is a heuristic tuned for >
- **No loop-closing mechanism.** There's no evidence in the design that a dismissed/snoozed nudge changes future b>
- **The demand-side of burnout isn't addressed.** The tool nudges the individual to self-regulate but does nothing>

**Bottom line:** the concept is well-designed for *hackathon judging* (privacy-by-construction is genuinely differ>
