## Inspiration

I stumbled onto the Slack Agent Builder Challenge with three days left on the clock, and almost scrolled past it. What stopped me was the "Agent for Good" track — because I'd been feeling the exact problem it was asking someone to solve.

Working alongside a high-cadence AI copilot changes your pace without you noticing. You stop taking the pauses a human normally takes between messages, between commits, between thoughts — because the model doesn't need them, so you stop giving yourself permission to either. Combine that with an always-on employer culture, and you get a burnout pattern that doesn't look like "too many hours." It looks like chain-coding at 11pm with no gap over four minutes between actions, because that's the rhythm the tool set and you just... kept up.

Nobody was building for that specific thing. So I built Pace.

## What it does

Pace is a Slack agent that notices when you're working at your copilot's pace instead of your own, and checks in privately — never publicly, never to your manager.

Two moments do the work:

- **The burst nudge.** When Pace detects a high-velocity streak of messages or PRs with barely a gap between them, it sends a private DM: *"You've sent 47 messages and 6 PRs in the last 3 hours, back to back, no gap over 4 min. That's not how humans code, that's how I code. Not judging the output — just flagging the pace."* Three buttons follow: dismiss it, get reminded in 30 minutes, or block recovery time on tomorrow's calendar.
- **The weekly digest.** Every week, a private reflection: nights worked past a threshold, the longest stretch without a break, and how your message tone has trended. Not a scorecard — a mirror.

Everything is opt-in through `/pace optin` or an App Home toggle, off by default, and reversible with `/pace optout` at any time. The only team-level view is anonymized aggregate stats across opted-in users — there's no way to request an individual's data through it, because the tool's schema doesn't have a parameter for one.

## How we built it

Slack Bolt on TypeScript, running in Socket Mode so there's no public endpoint to stand up mid-hackathon. Underneath that, an MCP server running in-process via a linked `InMemoryTransport` pair, exposing three tools — `get_user_activity_pattern`, `send_private_nudge`, `get_team_aggregate_wellbeing` — that the Bolt app calls through rather than touching detection logic directly. That boundary is also where consent gets enforced, inside the tool itself, so no MCP client can bypass it by going around the Slack UI.

Detection is a pure, independently-tested function: a rolling window over timestamped events, watching for a contiguous run with no gap past a threshold. It doesn't care where the events come from, which let us build two data sources that feed the exact same detector — a deterministic seed generator for a reliable, reproducible demo, and a real integration that shells out to the `gh` CLI to read genuine PR activity off GitHub (no token ever touches the codebase; `gh` manages its own credentials). We proved the real path works by opening and squash-merging twelve actual PRs against this repo in rapid succession and watching Pace catch the burst live, off real data, no seeding involved.

## Challenges we ran into

Most of the fight was in the seams between tools, not the core logic:

- **A zod version trap.** `@modelcontextprotocol/sdk` depends on zod's newer v3/v4-split package structure. Pinning our own zod to an older classic version caused npm to install a *second*, incompatible copy nested inside the SDK's own `node_modules`, and TypeScript quietly picked up the wrong one — producing baffling "missing 33 properties" errors that had nothing to do with our code. The fix was aligning our top-level zod to the same v4 the SDK actually uses, so npm deduplicates to one shared copy.
- **A Slack manifest field with inverted-sounding semantics.** `messages_tab_read_only_enabled: true` actually means users *can* send messages — the opposite of what the name suggests. Getting this backwards produced a confusing "has turned off direct messaging" banner that took real digging (and a docs lookup) to trace back to one boolean.
- **A sandboxed `gh` CLI.** Our GitHub CLI is snap-installed, which runs in an isolated view of `$HOME` — so `gh auth setup-git`'s global git config write silently didn't reach the file `git` actually reads. Solved by wiring the credential helper into the repo's *local* git config instead.
- **A cascading bug in our own demo tooling.** An invalid `--yes` flag on `gh pr merge` (removed in the installed CLI version) crashed our PR-generator script mid-loop, which meant later iterations tried to branch a demo directory off `main` before it had ever been merged there — a `git checkout -b` from an unmerged branch silently drops untracked files. Fixed by making directory creation idempotent inside the loop, not a one-time step outside it.

## Accomplishments that we're proud of

Getting a **real, non-seeded proof** working within the timeline: the same detector that powers the reproducible demo path also fired correctly off twelve genuine merged GitHub PRs, with zero synthetic data involved. That's the difference between a project that claims to work and one that's been shown to.

We're also proud that the privacy story isn't just a paragraph in the README — it's structural. Consent is checked inside the MCP tool itself. The aggregate-stats tool has no per-user parameter in its schema, full stop. A judge reading the code, not just the pitch, can verify both claims directly.

And shipping a tested, typed, working MVP — 10/10 tests passing, clean typecheck, real Slack app live in a sandbox workspace — in three days flat, starting from a hackathon we found with no runway left.

## What we learned

That "burnout from AI pace" is a real, nameable thing, and naming it precisely is most of the value — the framing did more work than any feature. That privacy has to be enforced at the lowest layer that can enforce it, not the UI layer, or it's not really a guarantee. And a handful of very specific technical lessons that'll outlast this hackathon: how zod's package restructuring can silently duplicate itself across a dependency tree, how snap-confined CLI tools can lie about where they've written config, and how easy it is to build a demo script that only works if every prior step succeeded.

## What's next for Pacing with the Machine

- **Real message-content signal**, not just timestamps — layering in actual Slack AI sentiment analysis for the tone trend, which is currently a length/punctuation heuristic labeled honestly as such.
- **Event-driven GitHub integration** (webhooks) instead of on-demand polling, so the burst detector reacts to real activity as it happens rather than on a manual trigger.
- **Validated thresholds.** The 10-events/3-hours/4-minute-gap heuristic was tuned to demo well, not against real burnout research — the next version should be informed by actual data on sustainable work patterns, and probably needs to be personalizable per role and working style.
- **A real calendar write** behind "block tomorrow 9-10am for a walk," instead of today's simulated confirmation — the nudge currently has no teeth, and that's the most honest gap in the design.
- **A closed feedback loop.** Right now a dismissed or snoozed nudge doesn't change future behavior — it's a single point-in-time notice, not a habit-forming system. Worth exploring what "the pattern kept happening" looks like as its own, higher-signal check-in.
- **Slack Marketplace submission**, once the above is solid enough to stand behind for real teams, not just a hackathon sandbox.
