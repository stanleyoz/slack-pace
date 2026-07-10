# Sandbox setup

Steps to create the Slack app, run Pace locally against your sandbox
workspace, and grant judge test access.

## 1. Create the app from manifest

1. Go to https://api.slack.com/apps → **Create New App** → **From an app manifest**.
2. Pick your sandbox/dev workspace.
3. Paste the contents of `manifest.json` from the repo root.
4. Review and create.

## 2. Enable Socket Mode & generate tokens

1. In the app config, go to **Socket Mode** → toggle it on. This generates
   an app-level token (`xapp-...`) — save it as `SLACK_APP_TOKEN`.
2. Go to **OAuth & Permissions** → **Install to Workspace**. After install,
   copy the **Bot User OAuth Token** (`xoxb-...`) — save it as
   `SLACK_BOT_TOKEN`.
3. Go to **Basic Information** → **App Credentials** → copy the
   **Signing Secret** — save it as `SLACK_SIGNING_SECRET`.
4. Copy your workspace/team ID (visible in the workspace URL or via
   `Admin` → `Settings`) — save it as `SLACK_TEAM_ID`.

## 3. Configure and run

```bash
cp .env.example .env
# fill in SLACK_BOT_TOKEN, SLACK_APP_TOKEN, SLACK_SIGNING_SECRET, SLACK_TEAM_ID

npm install
npm run dev
```

You should see `⚡️ Pace is running (Socket Mode).` in the terminal — that
confirms the Socket Mode connection to your workspace is live.

## 4. Invite the bot and opt in

In your sandbox workspace, DM the **Pace** app directly and run:

```
/pace optin
```

Open the app's **Home** tab to see the opt-in status and privacy summary.

## 5. Run the two demo hero moments

```bash
npm run demo:burst -- --user=U0123ABC    # Concept A: burst nudge
npm run demo:digest -- --user=U0123ABC   # Concept C: weekly digest
```

Replace `U0123ABC` with your own Slack user ID (Profile → More → Copy
member ID). Both commands seed synthetic activity and fire a real DM via
the MCP `send_private_nudge` tool — safe to re-run repeatedly while
rehearsing the demo video.

## 6. Grant judge test access

Add the following as collaborators/members with test access to your
sandbox workspace and app, per the hackathon submission requirements:

- `slackhack@salesforce.com`
- `testing@devpost.com`

In Slack: **Workspace Settings** → **Invite people**, or add them as
collaborators on the app config page under **Collaborators**.
