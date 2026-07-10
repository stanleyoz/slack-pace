# Narration script (word-for-word, ~3 min at natural pace)

Target: ~400 words / ~2:40–2:55 at 140–150 wpm, leaving buffer to slow down
at the DM reads without blowing the 3-minute cap. Cut points assume the
pitch deck (system/workflow diagrams, privacy grid) plays under narration
while the two live moments — the real GitHub burst and the Slack DM
arriving — get their own screen-recorded beat.

## Marker legend

The pitch deck (https://claude.ai/code/artifact/74554e57-cf1a-4696-b9f9-b3f63a0aaf21)
has anchor IDs matching each marker below — append `#id` to the deck URL to
jump straight to that section when screen-recording (e.g. `...#system`).

| Marker | What to show |
|---|---|
| `<SHOW: deck#hero>` | Deck hero section |
| `<SHOW: deck#problem>` | Deck problem section + blockquote |
| `<SHOW: deck#system>` | Deck system diagram |
| `<SHOW: terminal: npm run demo:generate-prs>` | Live terminal, PR creation running |
| `<SHOW: slack: DM arrives>` | Live Slack, the real burst-nudge DM landing |
| `<SHOW: deck#workflow>` | Deck workflow diagram |
| `<SHOW: deck#privacy>` | Deck privacy grid |
| `<SHOW: deck#stack>` | Deck tech stack + judging-criteria note |
| `<SHOW: deck#close>` | Deck close/CTA |

## Shot-by-shot (for editing sync)

**[0:00–0:15]** `<SHOW: deck#hero>`
> "Your AI copilot never gets tired. You do. This is Pace — a Slack agent
> for the Agent for Good track, built to notice something nobody else is
> naming: burnout from working at your copilot's pace, not your own."

**[0:15–0:45]** `<SHOW: deck#problem>`
> "Most wellness tools count hours. But chain-coding with a high-cadence AI
> assistant creates a different failure mode — humans quietly entraining
> to a machine's tempo. Here's the actual message Pace sends: [pause]
> 'You've sent 47 messages and 6 PRs in the last 3 hours, back to back, no
> gap over 4 minutes. That's not how humans code, that's how I code. Not
> judging the output, just flagging the pace.'"

**[0:45–1:05]** `<SHOW: deck#system>`
> "Every action Pace takes goes through a real MCP server boundary — not a
> checkbox integration. Three tools: read activity, send a nudge, and read
> team-level aggregate stats only."

**[1:05–1:13]** `<SHOW: terminal: npm run demo:generate-prs>`
> "To prove this isn't seeded, I opened twelve real pull requests against
> this repo and squash-merged them back to back. Watch what happens when
> Pace reads that straight off GitHub."

**[1:13–1:21]** `<SHOW: slack: DM arrives>`
> "[pause — let the DM visibly land] Twelve real PRs, zero seeded messages
> — and Pace caught it, live, using the exact same detector as every other
> demo."

**[1:21–1:43]** `<SHOW: deck#workflow>`
> "The full loop is simple: opt in, Pace watches quietly, a burst gets a
> private nudge, and every week a digest reflects back your longest
> stretch without a break and how your tone's been trending. Opt out any
> time, and it stops immediately."

**[1:43–2:09]** `<SHOW: deck#privacy>`
> "None of this works if it feels like surveillance. So consent is
> enforced inside the tool itself, not just the UI — no MCP client can
> bypass it. And the only team-level view is anonymized aggregate stats;
> there's no per-user parameter in that tool's schema at all. It's privacy
> by construction, not by policy."

**[2:09–2:25]** `<SHOW: deck#stack>`
> "Under the hood: Slack Bolt, Socket Mode, an in-process MCP server,
> Block Kit on the front end, real GitHub activity on the back end — a
> balanced build across all four judging criteria, not just a UI demo."

**[2:25–2:40]** `<SHOW: deck#close>`
> "Pace was built in three days because working at the machine's pace was
> never sustainable to begin with. Thanks for watching — the full repo,
> architecture, and privacy design are linked below."

---

## Marker-annotated script (drop straight into your video editor's timeline notes)

```
<SHOW: deck#hero>
Your AI copilot never gets tired. You do. This is Pace — a Slack agent for the Agent for Good track, built to notice something nobody else is naming: burnout from working at your copilot's pace, not your own.

<SHOW: deck#problem>
Most wellness tools count hours. But chain-coding with a high-cadence AI assistant creates a different failure mode — humans quietly entraining to a machine's tempo. Here's the actual message Pace sends:
[pause]
"You've sent 47 messages and 6 PRs in the last 3 hours, back to back, no gap over 4 minutes. That's not how humans code, that's how I code. Not judging the output, just flagging the pace."

<SHOW: deck#system>
Every action Pace takes goes through a real MCP server boundary — not a checkbox integration. Three tools: read activity, send a nudge, and read team-level aggregate stats only.

<SHOW: terminal: npm run demo:generate-prs>
To prove this isn't seeded, I opened twelve real pull requests against this repo and squash-merged them back to back. Watch what happens when Pace reads that straight off GitHub.

<SHOW: slack: DM arrives>
[pause — let the DM visibly land]
Twelve real PRs, zero seeded messages — and Pace caught it, live, using the exact same detector as every other demo.

<SHOW: deck#workflow>
The full loop is simple: opt in, Pace watches quietly, a burst gets a private nudge, and every week a digest reflects back your longest stretch without a break and how your tone's been trending. Opt out any time, and it stops immediately.

<SHOW: deck#privacy>
None of this works if it feels like surveillance. So consent is enforced inside the tool itself, not just the UI — no MCP client can bypass it. And the only team-level view is anonymized aggregate stats; there's no per-user parameter in that tool's schema at all. It's privacy by construction, not by policy.

<SHOW: deck#stack>
Under the hood: Slack Bolt, Socket Mode, an in-process MCP server, Block Kit on the front end, real GitHub activity on the back end — a balanced build across all four judging criteria, not just a UI demo.

<SHOW: deck#close>
Pace was built in three days because working at the machine's pace was never sustainable to begin with. Thanks for watching — the full repo, architecture, and privacy design are linked below.
```

---

## Clean text for ElevenLabs (narration only — no markers, paste directly)

Your AI copilot never gets tired. You do. This is Pace — a Slack agent for the Agent for Good track, built to notice something nobody else is naming: burnout from working at your copilot's pace, not your own.

Most wellness tools count hours. But chain-coding with a high-cadence AI assistant creates a different failure mode — humans quietly entraining to a machine's tempo. Here's the actual message Pace sends: [pause] "You've sent 47 messages and 6 PRs in the last 3 hours, back to back, no gap over 4 minutes. That's not how humans code, that's how I code. Not judging the output, just flagging the pace."

Every action Pace takes goes through a real MCP server boundary — not a checkbox integration. Three tools: read activity, send a nudge, and read team-level aggregate stats only. To prove this isn't seeded, I opened twelve real pull requests against this repo and squash-merged them back to back. Watch what happens when Pace reads that straight off GitHub. [cut to DM] Twelve real PRs, zero seeded messages — and Pace caught it, live, using the exact same detector as every other demo.

The full loop is simple: opt in, Pace watches quietly, a burst gets a private nudge, and every week a digest reflects back your longest stretch without a break and how your tone's been trending. Opt out any time, and it stops immediately.

None of this works if it feels like surveillance. So consent is enforced inside the tool itself, not just the UI — no MCP client can bypass it. And the only team-level view is anonymized aggregate stats; there's no per-user parameter in that tool's schema at all. It's privacy by construction, not by policy.

Under the hood: Slack Bolt, Socket Mode, an in-process MCP server, Block Kit on the front end, real GitHub activity on the back end — a balanced build across all four judging criteria, not just a UI demo.

Pace was built in three days because working at the machine's pace was never sustainable to begin with. Thanks for watching — the full repo, architecture, and privacy design are linked below.

---

## Timing notes

- ~400 words total. At 150 wpm that's ~2:40; at a slightly slower, more
  natural narration pace (135–140 wpm) it lands closer to 2:55 — both
  comfortably under the 3:00 hard cap.
- The two bracketed cues (`[pause]`, `[cut to DM]`) are editing beats, not
  narration — most TTS engines will either skip bracketed text or read it
  oddly, so strip them before pasting if ElevenLabs doesn't handle that
  gracefully in your account.
- If the final cut runs short, the natural place to add time is slowing
  down (not adding words) on the two blockquote reads — those are the
  emotional beats and can afford to breathe.
