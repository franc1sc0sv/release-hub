import type {
  IGitHubBranchCommitDetail,
  IGitHubClient,
} from '../../integration/interfaces/github-client.interface'

export async function fetchBranchCommitDetails(
  gitHubClient: IGitHubClient,
  repo: string,
  accessToken: string,
  branchNames: string[],
): Promise<Map<string, IGitHubBranchCommitDetail | null>> {
  return gitHubClient.getBranchCommitDetails(repo, branchNames, accessToken)
}
