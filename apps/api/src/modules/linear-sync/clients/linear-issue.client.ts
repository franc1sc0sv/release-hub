import { Injectable } from '@nestjs/common'
import { AppException } from '../../../common/errors/app.exception'
import { ErrorCode } from '../../../common/errors/error-codes.enum'
import { ILinearIssueClient } from '../interfaces/linear-issue-client.abstract'
import {
  LabelChange,
  type ILinearIssueSnapshot,
  type ILinearWorkflowState,
} from '../interfaces/linear-sync.interfaces'

const LINEAR_GRAPHQL_URL = 'https://api.linear.app/graphql' as const
const FLAG_LABEL_COLOR = '#F2994A' as const

const ISSUE_QUERY = `
  query LinearSyncIssue($id: String!) {
    issue(id: $id) {
      id
      identifier
      archivedAt
      team { id }
      state { id name type }
      labels { nodes { id } }
    }
  }
` as const

const TEAMS_QUERY = `
  query LinearSyncTeams {
    teams(first: 100) { nodes { key } }
  }
` as const

const WORKFLOW_STATES_QUERY = `
  query LinearSyncWorkflowStates($teamId: ID!) {
    workflowStates(filter: { team: { id: { eq: $teamId } } }, first: 100) {
      nodes { id name type }
    }
  }
` as const

const LABELS_QUERY = `
  query LinearSyncLabels($name: String!) {
    issueLabels(filter: { name: { eq: $name } }, first: 50) {
      nodes { id team { id } }
    }
  }
` as const

const CREATE_LABEL_MUTATION = `
  mutation LinearSyncCreateLabel($input: IssueLabelCreateInput!) {
    issueLabelCreate(input: $input) { success issueLabel { id } }
  }
` as const

const UPDATE_ISSUE_MUTATION = `
  mutation LinearSyncUpdateIssue($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) { success }
  }
` as const

const COMMENT_MUTATION = `
  mutation LinearSyncComment($input: CommentCreateInput!) {
    commentCreate(input: $input) { success }
  }
` as const

interface ILinearGraphqlResponse<TData> {
  data?: TData
  errors?: { message: string }[]
}

interface IIssueData {
  issue: {
    id: string
    identifier: string
    archivedAt: string | null
    team: { id: string }
    state: ILinearWorkflowState
    labels: { nodes: { id: string }[] }
  } | null
}

interface ITeamsData {
  teams: { nodes: { key: string }[] }
}

interface IWorkflowStatesData {
  workflowStates: { nodes: ILinearWorkflowState[] }
}

interface ILabelsData {
  issueLabels: { nodes: { id: string; team: { id: string } | null }[] }
}

interface ICreateLabelData {
  issueLabelCreate: { success: boolean; issueLabel: { id: string } | null }
}

interface IUpdateIssueData {
  issueUpdate: { success: boolean }
}

interface ICommentData {
  commentCreate: { success: boolean }
}

const ENTITY_NOT_FOUND_MESSAGE = 'Entity not found'

@Injectable()
export class LinearIssueClient extends ILinearIssueClient {
  async listTeamKeys(token: string): Promise<ReadonlySet<string>> {
    const data = await this.request<ITeamsData>(TEAMS_QUERY, {}, token)
    return new Set((data?.teams.nodes ?? []).map((team) => team.key.toUpperCase()))
  }

  async findIssue(identifier: string, token: string): Promise<ILinearIssueSnapshot | null> {
    const data = await this.request<IIssueData>(ISSUE_QUERY, { id: identifier }, token, true)
    const issue = data?.issue
    if (!issue) return null
    return {
      id: issue.id,
      identifier: issue.identifier,
      teamId: issue.team.id,
      state: issue.state,
      labelIds: issue.labels.nodes.map((label) => label.id),
      archived: issue.archivedAt !== null,
    }
  }

  async findWorkflowState(teamId: string, name: string, token: string): Promise<ILinearWorkflowState | null> {
    const data = await this.request<IWorkflowStatesData>(WORKFLOW_STATES_QUERY, { teamId }, token)
    return data?.workflowStates.nodes.find((state) => state.name === name) ?? null
  }

  async ensureLabel(teamId: string, name: string, token: string): Promise<string> {
    const data = await this.request<ILabelsData>(LABELS_QUERY, { name }, token)
    const labels = data?.issueLabels.nodes ?? []
    const existing =
      labels.find((label) => label.team?.id === teamId) ?? labels.find((label) => label.team === null)
    if (existing) return existing.id

    const created = await this.request<ICreateLabelData>(
      CREATE_LABEL_MUTATION,
      { input: { name, teamId, color: FLAG_LABEL_COLOR } },
      token,
    )
    const labelId = created?.issueLabelCreate.issueLabel?.id
    if (!created?.issueLabelCreate.success || !labelId) {
      throw new AppException(`Linear did not create the label ${name}`, ErrorCode.INTEGRATION_ERROR)
    }
    return labelId
  }

  async setState(issueId: string, stateId: string, token: string): Promise<void> {
    await this.updateIssue(issueId, { stateId }, token)
  }

  async changeLabel(issueId: string, labelId: string, change: LabelChange, token: string): Promise<void> {
    const input = change === LabelChange.ADD ? { addedLabelIds: [labelId] } : { removedLabelIds: [labelId] }
    await this.updateIssue(issueId, input, token)
  }

  async comment(issueId: string, body: string, token: string): Promise<void> {
    const data = await this.request<ICommentData>(COMMENT_MUTATION, { input: { issueId, body } }, token)
    if (!data?.commentCreate.success) {
      throw new AppException('Linear did not save the comment', ErrorCode.INTEGRATION_ERROR)
    }
  }

  private async updateIssue(issueId: string, input: Record<string, unknown>, token: string): Promise<void> {
    const data = await this.request<IUpdateIssueData>(UPDATE_ISSUE_MUTATION, { id: issueId, input }, token)
    if (!data?.issueUpdate.success) {
      throw new AppException('Linear did not update the ticket', ErrorCode.INTEGRATION_ERROR)
    }
  }

  private async request<TData>(
    query: string,
    variables: Record<string, unknown>,
    token: string,
    allowNotFound = false,
  ): Promise<TData | null> {
    const response = await fetch(LINEAR_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables }),
    })

    const payload = (await response.json()) as ILinearGraphqlResponse<TData>
    const errors = payload.errors ?? []

    if (allowNotFound && errors.some((error) => error.message.includes(ENTITY_NOT_FOUND_MESSAGE))) {
      return null
    }
    if (!response.ok || errors.length > 0) {
      const message = errors.map((error) => error.message).join('; ') || `HTTP ${response.status}`
      throw new AppException(`Linear request failed: ${message}`, ErrorCode.INTEGRATION_ERROR)
    }
    return payload.data ?? null
  }
}
