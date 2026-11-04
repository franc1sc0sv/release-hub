import type { ILinearIssueSnapshot, ILinearWorkflowState, LabelChange } from './linear-sync.interfaces'

export abstract class ILinearIssueClient {
  abstract listTeamKeys(token: string): Promise<ReadonlySet<string>>
  abstract findIssue(identifier: string, token: string): Promise<ILinearIssueSnapshot | null>
  abstract findWorkflowState(teamId: string, name: string, token: string): Promise<ILinearWorkflowState | null>
  abstract ensureLabel(teamId: string, name: string, token: string): Promise<string>
  abstract setState(issueId: string, stateId: string, token: string): Promise<void>
  abstract changeLabel(issueId: string, labelId: string, change: LabelChange, token: string): Promise<void>
  abstract comment(issueId: string, body: string, token: string): Promise<void>
}
