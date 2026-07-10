# Judge test: trigger a real Pace alert

Self-serve, ~2 minutes, no terminal or GitHub access needed — this
triggers a real, live Slack DM using the same detection code as the rest
of the project, not a canned demo.

## 1. Open a DM with Pace — not the shared channel

You've been added to a shared channel in the sandbox workspace so Pace can
see you as a guest. **Do not run these steps by posting in that channel**
— Pace only listens for direct messages (`message.im`), by design, to
avoid needing broad channel-reading permissions. Messages posted in the
channel itself are invisible to Pace and nothing will happen.

To open an actual 1:1 DM:
- Press **Cmd/Ctrl+K**, type **Pace**, and select it — this opens the
  direct conversation, distinct from the channel, **or**
- Click directly on the **"Pace"** name/avatar wherever it appears (e.g.
  an `@Pace` mention) to open its profile card, then click **Message**.

You'll know you're in the right place if the conversation header shows
just **Pace** (a 1:1 DM), not the channel name.

## 2. Opt in

**In that DM**, send:
```
/pace optin
```
Pace replies privately confirming you're opted in. Nothing happens until
this step — opt-in is required by design. (If you ran this in the
channel by mistake earlier, run it again here — state doesn't carry
over.)

## 3. Trigger a burst

**Still in the DM**, send Pace **10 or more messages within a few
minutes**, with no gap longer than 4 minutes between them. Content
doesn't matter — the fastest way is to paste and send each of these one
at a time, quickly:

```
1
2
3
4
5
6
7
8
9
10
11
12
```

## 4. Watch for the alert

Within a couple seconds of crossing the threshold, Pace sends you a
private DM:

> "You've sent N messages and 0 PRs in the last 3 hours, back to back, no
> gap over 4 min. That's not how humans code, that's how I code. Not
> judging the output — just flagging the pace."

with three buttons: **Nothing, I'm good**, **Remind me in 30 min**,
**Block tomorrow 9–10am for a walk**. Click any of them to confirm the
interactive handlers work.

## 5. Opt out (optional)

```
/pace optout
```
Confirms check-ins stop immediately.

---

## What this proves

- The alert is **not seeded or pre-recorded** — it's produced live from
  the messages you just sent, run through `detectBurst()`
  (`src/detection/burstDetector.ts`), the same function covered by the
  project's unit tests.
- It went through the required **MCP server integration**: the message
  listener calls the `get_user_activity_pattern` and `send_private_nudge`
  MCP tools (`src/mcp/client.ts` → `src/mcp/server.ts`), not detection
  logic directly.
- **Consent was enforced**: if you hadn't run `/pace optin` first, step 4
  would never fire — the check happens inside `send_private_nudge` itself,
  not in the UI layer.

For the deeper technical proof (12 real GitHub PRs detected via live
`gh` CLI activity, no seeding at all), see the demo video and
`docs/architecture.md`.
