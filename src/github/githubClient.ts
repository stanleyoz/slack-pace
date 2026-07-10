import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface RawPullRequest {
  number: number;
  title: string;
  url: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Shells out to the already-authenticated `gh` CLI rather than handling a
 * GitHub token directly in this codebase — `gh` manages its own credential
 * store, so no token is ever read into process env, logged, or persisted
 * here.
 */
export async function fetchPullRequests(
  repo: string,
  author: string,
  limit = 100
): Promise<RawPullRequest[]> {
  const { stdout } = await execFileAsync("gh", [
    "pr",
    "list",
    "--repo",
    repo,
    "--author",
    author,
    "--state",
    "all",
    "--limit",
    String(limit),
    "--json",
    "number,title,url,createdAt,updatedAt",
  ]);

  return JSON.parse(stdout) as RawPullRequest[];
}
