import { ActivityEvent } from "../types";
import { fetchPullRequests, RawPullRequest } from "./githubClient";

/**
 * Maps raw GitHub PRs to ActivityEvents against a given Slack user id.
 *
 * Note on identity: this deliberately does not attempt real GitHub-username
 * -> Slack-user-id resolution (e.g. via email lookup) — that's out of scope
 * for the hackathon build. The caller supplies the Slack user id explicitly,
 * matching how a real deployment would store this mapping per-user once,
 * at opt-in time.
 *
 * Uses createdAt as the event timestamp — each PR open is one "pr" event,
 * which is what feeds detectBurst() identically to any other ActivityEvent.
 */
export function mapPullRequestsToEvents(
  prs: RawPullRequest[],
  slackUserId: string
): ActivityEvent[] {
  return prs.map((pr) => ({
    userId: slackUserId,
    type: "pr" as const,
    ts: new Date(pr.createdAt).getTime(),
  }));
}

export interface FetchGithubActivityOptions {
  repo: string;
  githubUsername: string;
  slackUserId: string;
  sinceMinutes?: number;
}

/** Fetches real PR activity from GitHub and returns it as ActivityEvents, filtered to the recent window. */
export async function fetchGithubActivityEvents(
  opts: FetchGithubActivityOptions
): Promise<ActivityEvent[]> {
  const { repo, githubUsername, slackUserId, sinceMinutes = 180 } = opts;

  const prs = await fetchPullRequests(repo, githubUsername);
  const events = mapPullRequestsToEvents(prs, slackUserId);

  const cutoff = Date.now() - sinceMinutes * 60_000;
  return events.filter((e) => e.ts >= cutoff);
}
