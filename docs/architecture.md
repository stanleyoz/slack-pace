# Architecture

Pace is a Slack Bolt (Socket Mode) app with an in-process MCP server as the
integration seam between Slack and Pace's detection/store logic. The Bolt
app never calls detection or storage code directly — every read or action
goes through the MCP client, so MCP server integration is a real boundary,
not a decorative wrapper.

```mermaid
flowchart LR
    subgraph Slack
        U[User] -->|DMs, slash cmds, button clicks| SlackAPI[Slack Platform]
    end

    SlackAPI <-->|Socket Mode| Bolt[Bolt App\nsrc/app.ts]

    Bolt -->|action_id handlers| Actions[bolt/actions.ts]
    Bolt -->|"/pace optin|optout|status"| Commands[bolt/commands.ts]
    Bolt -->|App Home| Home[bolt/home.ts]

    Actions --> McpClient[MCP Client\nsrc/mcp/client.ts]
    Commands --> Consent[detection/consent.ts]
    Home --> Consent

    McpClient <-->|InMemoryTransport| McpServer[MCP Server\nsrc/mcp/server.ts]

    McpServer --> T1[get_user_activity_pattern]
    McpServer --> T2[send_private_nudge]
    McpServer --> T3[get_team_aggregate_wellbeing]

    T1 --> Burst[detection/burstDetector.ts]
    T1 --> Store[store/memoryStore.ts]
    T2 --> Consent
    T2 --> Messages[bolt/messages.ts]
    T2 -->|chat.postMessage| SlackAPI
    T3 --> Digest[detection/weeklyDigest.ts]
    T3 --> Store

    Seed[seed/seedEvents.ts\nseed/seedWeek.ts] -.->|demo trigger scripts| Store
    GitHub[GitHub REST API\nvia gh CLI] -->|src/github/githubActivity.ts| Store
```

## Two data sources feeding the same detector

`detectBurst()` and `computeWeeklyDigest()` don't know or care where their
`ActivityEvent[]` input came from — there are two independent producers:

- **Seeded** (`src/seed/seedEvents.ts`, `src/seed/seedWeek.ts`) —
  deterministic synthetic data, used by `scripts/trigger-burst-demo.ts` and
  `scripts/trigger-digest-demo.ts` for a reliable, reproducible demo
  regardless of real usage history.
- **Real GitHub PR activity** (`src/github/githubActivity.ts`) — shells out
  to the already-authenticated `gh` CLI (`gh pr list --json ...`), so no
  GitHub token is ever read into this codebase's env or logs. Raw PRs are
  mapped to `ActivityEvent{type:'pr'}` records and run through the exact
  same `detectBurst()`. `scripts/poll-github-and-nudge.ts` is the live
  version of the burst-nudge trigger, sourced from genuine repo activity
  instead of synthetic events — `scripts/generate-demo-prs.ts` produces
  that real activity by creating and squash-merging a handful of small PRs
  in rapid succession.

## Why an in-process MCP server

For a 3-day build, running the MCP server as a linked `InMemoryTransport`
pair inside the same Node process eliminates cross-process/stdio flakiness
during live demo recording, while keeping the MCP tool-call boundary fully
real: the Bolt layer only ever talks to `src/mcp/client.ts`, never to
`detection/*` or `store/*` directly. The server could be moved to a
standalone `StdioServerTransport` process without changing any tool code.

## Privacy enforced by construction, not just policy

- `send_private_nudge` checks `consentStore.isOptedIn()` **inside the tool
  itself**, so no MCP client can bypass consent.
- `get_team_aggregate_wellbeing` has no `userId` parameter in its schema at
  all — per-user data literally cannot be requested through it.
