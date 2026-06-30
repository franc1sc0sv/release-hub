/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AcceptSuggestedFeatureInput = {
  description: InputMaybe<Scalars['String']['input']>;
  featureId: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  tags: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AiDraftStatus =
  | 'FAILED'
  | 'PENDING'
  | 'READY'
  | 'RUNNING';

export type AiSuggestionType = {
  __typename?: 'AiSuggestionType';
  confidence: Scalars['Float']['output'];
  featureId: Scalars['ID']['output'];
  rationale: Scalars['String']['output'];
};

export type AssignPrToFeatureInput = {
  featureId: Scalars['ID']['input'];
  prId: Scalars['ID']['input'];
};

export type AuthTokensType = {
  __typename?: 'AuthTokensType';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type CommitType = {
  __typename?: 'CommitType';
  author: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  message: Scalars['String']['output'];
  sha: Scalars['String']['output'];
};

export type ConfirmReleaseInput = {
  releaseId: Scalars['ID']['input'];
};

export type ConnectionHealthType = {
  __typename?: 'ConnectionHealthType';
  flagsmith: IntegrationStatus;
  github: IntegrationStatus;
  linear: IntegrationStatus;
};

export type ConnectionSettingsType = {
  __typename?: 'ConnectionSettingsType';
  flagsmithConnected: Scalars['Boolean']['output'];
  flagsmithProjectId: Maybe<Scalars['String']['output']>;
  flagsmithUrl: Maybe<Scalars['String']['output']>;
  githubConnected: Scalars['Boolean']['output'];
  linearConnected: Scalars['Boolean']['output'];
};

export type CoverageType = {
  __typename?: 'CoverageType';
  assigned: Scalars['Int']['output'];
  ready: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type CreateFeatureInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  tags: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateGithubBranchInput = {
  fromRef: Scalars['String']['input'];
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type CreateProjectInput = {
  name: Scalars['String']['input'];
  repo: Scalars['String']['input'];
};

export type CreateProjectTagInput = {
  color: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type CreateReleaseInput = {
  baseRef: Scalars['String']['input'];
  compareRef: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  tags: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DeleteProjectTagInput = {
  tagId: Scalars['ID']['input'];
};

export type ExportFormat =
  | 'MD'
  | 'PDF';

export type ExportResultType = {
  __typename?: 'ExportResultType';
  filename: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ExportSummaryInput = {
  format: ExportFormat;
  releaseId: Scalars['ID']['input'];
};

export type FeatureDetailType = {
  __typename?: 'FeatureDetailType';
  feature: FeatureType;
  prs: Array<PullRequestType>;
  releases: Array<ReleaseObjectType>;
  snapshots: Array<FeatureReleaseSnapshotType>;
};

export type FeatureKind =
  | 'DEFAULT'
  | 'PRODUCT';

export type FeatureReleaseSnapshotType = {
  __typename?: 'FeatureReleaseSnapshotType';
  releaseId: Scalars['ID']['output'];
  state: FeatureState;
};

export type FeatureState =
  | 'BLOCKED'
  | 'FLAG_CLEANUP_PENDING'
  | 'FULLY_RELEASED'
  | 'IN_PROGRESS'
  | 'LIVE_PROD'
  | 'LIVE_STAGING'
  | 'PARTIAL'
  | 'SHIPPED_FLAG_OFF';

export type FeatureType = {
  __typename?: 'FeatureType';
  createdAt: Scalars['DateTime']['output'];
  currentState: FeatureState;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  kind: FeatureKind;
  name: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  suggested: Scalars['Boolean']['output'];
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type FlagComparisonResultType = {
  __typename?: 'FlagComparisonResultType';
  baselineEnvironments: Array<Scalars['String']['output']>;
  comparedEnvironments: Array<Scalars['String']['output']>;
  items: Array<FlagComparisonRowType>;
};

export type FlagComparisonRowType = {
  __typename?: 'FlagComparisonRowType';
  baseline: Array<FlagEnvironmentStateType>;
  baselineConflict: Scalars['Boolean']['output'];
  baselineEnabled: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  divergences: Array<FlagEnvironmentStateType>;
  key: Scalars['String']['output'];
};

export type FlagEnvironmentStateType = {
  __typename?: 'FlagEnvironmentStateType';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type FlagRefType = {
  __typename?: 'FlagRefType';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  environments: Array<FlagEnvironmentStateType>;
  key: Scalars['String']['output'];
};

export type FlagSortField =
  | 'CREATED'
  | 'ENVIRONMENT'
  | 'NAME';

export type FlagStateType = {
  __typename?: 'FlagStateType';
  production: Scalars['Boolean']['output'];
  staging: Scalars['Boolean']['output'];
};

export type FlagsResultType = {
  __typename?: 'FlagsResultType';
  environments: Array<Scalars['String']['output']>;
  items: Array<FlagRefType>;
  totalCount: Scalars['Float']['output'];
};

export type FlagsmithProjectType = {
  __typename?: 'FlagsmithProjectType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type FlagsmithVerifyResult = {
  __typename?: 'FlagsmithVerifyResult';
  environments: Array<Scalars['String']['output']>;
  hasProduction: Scalars['Boolean']['output'];
  hasStaging: Scalars['Boolean']['output'];
  message: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  projectName: Maybe<Scalars['String']['output']>;
  warnings: Array<Scalars['String']['output']>;
};

export type GenerateSummaryInput = {
  featureIds: InputMaybe<Array<Scalars['ID']['input']>>;
  model: InputMaybe<Scalars['String']['input']>;
  releaseId: Scalars['ID']['input'];
  tone: InputMaybe<Scalars['String']['input']>;
};

export type GetFlagsInput = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
  sortDirection: InputMaybe<SortDirection>;
  sortEnvironment: InputMaybe<Scalars['String']['input']>;
  sortField: InputMaybe<FlagSortField>;
};

export type GithubBranchType = {
  __typename?: 'GithubBranchType';
  commitSha: Scalars['String']['output'];
  name: Scalars['String']['output'];
  protected: Scalars['Boolean']['output'];
};

export type GithubConnectionStatus = {
  __typename?: 'GithubConnectionStatus';
  connected: Scalars['Boolean']['output'];
  githubLogin: Maybe<Scalars['String']['output']>;
};

export type GithubRepositoryType = {
  __typename?: 'GithubRepositoryType';
  defaultBranch: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  htmlUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  owner: Scalars['String']['output'];
  private: Scalars['Boolean']['output'];
};

export type IntegrationStatus =
  | 'CONNECTED'
  | 'NOT_CONFIGURED';

export type InvitationStatus =
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'PENDING'
  | 'REVOKED';

export type InvitationType = {
  __typename?: 'InvitationType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  invitedById: Scalars['ID']['output'];
  projectId: Scalars['ID']['output'];
  role: ProjectRole;
  status: InvitationStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type InviteMemberInput = {
  email: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  role: ProjectRole;
};

export type LinearConnectionStatus = {
  __typename?: 'LinearConnectionStatus';
  connected: Scalars['Boolean']['output'];
  linearUser: Maybe<Scalars['String']['output']>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginWithCodeInput = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type LogoutInput = {
  refreshToken: Scalars['String']['input'];
};

export type MemberType = {
  __typename?: 'MemberType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  role: ProjectRole;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptInvitation: MemberType;
  acceptSuggestedFeature: FeatureType;
  assignPrToFeature: Scalars['Boolean']['output'];
  confirmRelease: ReleaseObjectType;
  createFeature: FeatureType;
  createGithubBranch: GithubBranchType;
  createProject: ProjectType;
  createProjectTag: ProjectTagType;
  createRelease: ReleaseObjectType;
  deleteFeature: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteProjectTag: Scalars['Boolean']['output'];
  deleteRelease: ReleaseObjectType;
  disconnectGithub: Scalars['Boolean']['output'];
  disconnectLinear: Scalars['Boolean']['output'];
  generatePrSummary: PullRequestType;
  inviteMember: InvitationType;
  login: AuthTokensType;
  loginWithCode: AuthTokensType;
  logout: Scalars['Boolean']['output'];
  reauthorizeGithub: Scalars['Boolean']['output'];
  refreshToken: AuthTokensType;
  regenerateDraft: ReleaseObjectType;
  register: AuthTokensType;
  rejectSuggestedFeature: Scalars['Boolean']['output'];
  removeMember: Scalars['Boolean']['output'];
  requestLoginCode: Scalars['Boolean']['output'];
  revokeInvitation: Scalars['Boolean']['output'];
  savePrSummary: PullRequestType;
  saveReleaseSummary: ReleaseObjectType;
  setFeatureState: FeatureType;
  setFeatureTags: FeatureType;
  setReleaseStatus: ReleaseObjectType;
  shipRelease: ReleaseObjectType;
  updateConnectionSettings: ConnectionSettingsType;
  updateMemberRole: MemberType;
  updateProject: ProjectType;
  updateRelease: ReleaseObjectType;
};


export type MutationAcceptInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationAcceptSuggestedFeatureArgs = {
  input: AcceptSuggestedFeatureInput;
};


export type MutationAssignPrToFeatureArgs = {
  input: AssignPrToFeatureInput;
};


export type MutationConfirmReleaseArgs = {
  input: ConfirmReleaseInput;
};


export type MutationCreateFeatureArgs = {
  input: CreateFeatureInput;
};


export type MutationCreateGithubBranchArgs = {
  input: CreateGithubBranchInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateProjectTagArgs = {
  input: CreateProjectTagInput;
};


export type MutationCreateReleaseArgs = {
  input: CreateReleaseInput;
};


export type MutationDeleteFeatureArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectTagArgs = {
  input: DeleteProjectTagInput;
};


export type MutationDeleteReleaseArgs = {
  releaseId: Scalars['ID']['input'];
};


export type MutationDisconnectLinearArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationGeneratePrSummaryArgs = {
  prId: Scalars['ID']['input'];
};


export type MutationInviteMemberArgs = {
  input: InviteMemberInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLoginWithCodeArgs = {
  input: LoginWithCodeInput;
};


export type MutationLogoutArgs = {
  input: LogoutInput;
};


export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput;
};


export type MutationRegenerateDraftArgs = {
  releaseId: Scalars['ID']['input'];
  resume?: Scalars['Boolean']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRejectSuggestedFeatureArgs = {
  input: RejectSuggestedFeatureInput;
};


export type MutationRemoveMemberArgs = {
  membershipId: Scalars['ID']['input'];
};


export type MutationRequestLoginCodeArgs = {
  input: RequestLoginCodeInput;
};


export type MutationRevokeInvitationArgs = {
  invitationId: Scalars['ID']['input'];
};


export type MutationSavePrSummaryArgs = {
  input: SavePrSummaryInput;
};


export type MutationSaveReleaseSummaryArgs = {
  input: SaveReleaseSummaryInput;
};


export type MutationSetFeatureStateArgs = {
  input: SetFeatureStateInput;
};


export type MutationSetFeatureTagsArgs = {
  input: SetFeatureTagsInput;
};


export type MutationSetReleaseStatusArgs = {
  input: SetReleaseStatusInput;
};


export type MutationShipReleaseArgs = {
  input: ShipReleaseInput;
};


export type MutationUpdateConnectionSettingsArgs = {
  input: UpdateConnectionSettingsInput;
};


export type MutationUpdateMemberRoleArgs = {
  input: UpdateMemberRoleInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateReleaseArgs = {
  input: UpdateReleaseInput;
};

export type PrAssignmentInput = {
  featureId: InputMaybe<Scalars['ID']['input']>;
  pullRequestId: Scalars['ID']['input'];
};

export type ProjectIntegrationsType = {
  __typename?: 'ProjectIntegrationsType';
  flagsmith: Scalars['Boolean']['output'];
  github: Scalars['Boolean']['output'];
  linear: Scalars['Boolean']['output'];
};

export type ProjectRole =
  | 'MEMBER'
  | 'OWNER'
  | 'VIEWER';

export type ProjectTagType = {
  __typename?: 'ProjectTagType';
  color: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ProjectType = {
  __typename?: 'ProjectType';
  connectionHealth: ConnectionHealthType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  integrations: ProjectIntegrationsType;
  name: Scalars['String']['output'];
  ownerId: Scalars['String']['output'];
  repo: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PullRequestType = {
  __typename?: 'PullRequestType';
  aiConfidence: Maybe<Scalars['Float']['output']>;
  aiRationale: Maybe<Scalars['String']['output']>;
  author: Scalars['String']['output'];
  body: Maybe<Scalars['String']['output']>;
  commits: Array<CommitType>;
  featureId: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  mergedAt: Scalars['DateTime']['output'];
  number: Scalars['Int']['output'];
  releaseId: Maybe<Scalars['ID']['output']>;
  summary: Maybe<Scalars['String']['output']>;
  summaryEditedAt: Maybe<Scalars['DateTime']['output']>;
  tickets: Array<TicketLinkType>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  compareFlags: FlagComparisonResultType;
  compareRefs: RefComparisonType;
  diffRefs: Array<PullRequestType>;
  exportSummary: ExportResultType;
  flagsmithProjects: Array<FlagsmithProjectType>;
  getConnectionSettings: ConnectionSettingsType;
  getCoverage: CoverageType;
  getFeature: FeatureDetailType;
  getFlags: FlagsResultType;
  getProject: ProjectType;
  getRelease: ReleaseObjectType;
  getReleaseTree: ReleaseTreeType;
  getReleases: Array<ReleaseObjectType>;
  githubAuthorizeUrl: Scalars['String']['output'];
  githubBranches: Array<GithubBranchType>;
  githubConnection: GithubConnectionStatus;
  githubRepositories: Array<GithubRepositoryType>;
  linearAuthorizeUrl: Scalars['String']['output'];
  linearConnection: LinearConnectionStatus;
  listFeatures: Array<FeatureType>;
  listInvitations: Array<InvitationType>;
  listMembers: Array<MemberType>;
  listProjects: Array<ProjectType>;
  me: UserProfileType;
  projectTags: Array<ProjectTagType>;
  suggestFeatureForPr: AiSuggestionType;
  verifyFlagsmithConnection: FlagsmithVerifyResult;
};


export type QueryCompareFlagsArgs = {
  baselineEnvironments: Array<Scalars['String']['input']>;
  comparedEnvironments: Array<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};


export type QueryCompareRefsArgs = {
  baseRef: Scalars['String']['input'];
  compareRef: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryDiffRefsArgs = {
  baseRef: Scalars['String']['input'];
  compareRef: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryExportSummaryArgs = {
  input: ExportSummaryInput;
};


export type QueryFlagsmithProjectsArgs = {
  apiKey: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  url: Scalars['String']['input'];
};


export type QueryGetConnectionSettingsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryGetCoverageArgs = {
  releaseId: Scalars['ID']['input'];
};


export type QueryGetFeatureArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetFlagsArgs = {
  input: GetFlagsInput;
};


export type QueryGetProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetReleaseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetReleaseTreeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetReleasesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryGithubBranchesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryLinearAuthorizeUrlArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryLinearConnectionArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryListFeaturesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryListInvitationsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryListMembersArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryProjectTagsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QuerySuggestFeatureForPrArgs = {
  prId: Scalars['ID']['input'];
};


export type QueryVerifyFlagsmithConnectionArgs = {
  apiKey: Scalars['String']['input'];
  flagsmithProjectId: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  url: Scalars['String']['input'];
};

export type RefCommitType = {
  __typename?: 'RefCommitType';
  author: Scalars['String']['output'];
  committedAt: Scalars['String']['output'];
  message: Scalars['String']['output'];
  sha: Scalars['String']['output'];
};

export type RefComparisonType = {
  __typename?: 'RefComparisonType';
  aheadBy: Scalars['Int']['output'];
  behindBy: Scalars['Int']['output'];
  commits: Array<RefCommitType>;
  totalCommits: Scalars['Int']['output'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RejectSuggestedFeatureInput = {
  featureId: Scalars['ID']['input'];
};

export type ReleaseFeatureNodeType = {
  __typename?: 'ReleaseFeatureNodeType';
  clientAvailabilityKey: Scalars['String']['output'];
  feature: FeatureType;
  flagState: Maybe<FlagStateType>;
  prs: Array<PullRequestType>;
  state: FeatureState;
};

export type ReleaseObjectType = {
  __typename?: 'ReleaseObjectType';
  aiDraftStatus: AiDraftStatus;
  baseRef: Scalars['String']['output'];
  compareRef: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  prUrl: Maybe<Scalars['String']['output']>;
  projectId: Scalars['ID']['output'];
  status: ReleaseStatus;
  summary: Maybe<Scalars['String']['output']>;
  summaryEditedAt: Maybe<Scalars['DateTime']['output']>;
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReleaseStatus =
  | 'CANCELED'
  | 'DEPLOYED'
  | 'DRAFT'
  | 'MERGED'
  | 'READY_TO_RELEASE';

export type ReleaseTreeType = {
  __typename?: 'ReleaseTreeType';
  features: Array<ReleaseFeatureNodeType>;
  release: ReleaseObjectType;
};

export type RequestLoginCodeInput = {
  email: Scalars['String']['input'];
};

export type SavePrSummaryInput = {
  prId: Scalars['String']['input'];
  summary: Scalars['String']['input'];
};

export type SaveReleaseSummaryInput = {
  releaseId: Scalars['ID']['input'];
  summary: Scalars['String']['input'];
};

export type SetFeatureStateInput = {
  featureId: Scalars['ID']['input'];
  state: FeatureState;
};

export type SetFeatureTagsInput = {
  featureId: Scalars['ID']['input'];
  tags: Array<Scalars['String']['input']>;
};

export type SetReleaseStatusInput = {
  releaseId: Scalars['ID']['input'];
  status: ReleaseStatus;
};

export type ShipReleaseInput = {
  releaseId: Scalars['ID']['input'];
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type Subscription = {
  __typename?: 'Subscription';
  generateSummary: SummaryChunkType;
};


export type SubscriptionGenerateSummaryArgs = {
  input: GenerateSummaryInput;
};

export type SummaryChunkType = {
  __typename?: 'SummaryChunkType';
  chunk: Scalars['String']['output'];
  done: Scalars['Boolean']['output'];
};

export type TicketLinkType = {
  __typename?: 'TicketLinkType';
  confidence: Scalars['Float']['output'];
  description: Maybe<Scalars['String']['output']>;
  issueId: Scalars['String']['output'];
  source: TicketSource;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type TicketSource =
  | 'JIRA'
  | 'LINEAR';

export type UpdateConnectionSettingsInput = {
  flagsmithApiKey: InputMaybe<Scalars['String']['input']>;
  flagsmithProjectId: InputMaybe<Scalars['String']['input']>;
  flagsmithUrl: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type UpdateMemberRoleInput = {
  membershipId: Scalars['ID']['input'];
  role: ProjectRole;
};

export type UpdateProjectInput = {
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  repo: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReleaseInput = {
  prAssignments: InputMaybe<Array<PrAssignmentInput>>;
  releaseId: Scalars['ID']['input'];
  tags: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UserProfileType = {
  __typename?: 'UserProfileType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthTokensType', accessToken: string, refreshToken: string } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthTokensType', accessToken: string, refreshToken: string } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'UserProfileType', id: string, email: string, name: string, avatarUrl: string | null } };

export type RequestLoginCodeMutationVariables = Exact<{
  input: RequestLoginCodeInput;
}>;


export type RequestLoginCodeMutation = { __typename?: 'Mutation', requestLoginCode: boolean };

export type LoginWithCodeMutationVariables = Exact<{
  input: LoginWithCodeInput;
}>;


export type LoginWithCodeMutation = { __typename?: 'Mutation', loginWithCode: { __typename?: 'AuthTokensType', accessToken: string, refreshToken: string } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthTokensType', accessToken: string, refreshToken: string } };

export type ListMembersQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ListMembersQuery = { __typename?: 'Query', listMembers: Array<{ __typename?: 'MemberType', id: string, userId: string, projectId: string, role: ProjectRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string }> };

export type ListInvitationsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ListInvitationsQuery = { __typename?: 'Query', listInvitations: Array<{ __typename?: 'InvitationType', id: string, email: string, projectId: string, role: ProjectRole, status: InvitationStatus, expiresAt: string, invitedById: string, createdAt: string, updatedAt: string }> };

export type InviteMemberMutationVariables = Exact<{
  input: InviteMemberInput;
}>;


export type InviteMemberMutation = { __typename?: 'Mutation', inviteMember: { __typename?: 'InvitationType', id: string, email: string, projectId: string, role: ProjectRole, status: InvitationStatus, expiresAt: string, invitedById: string, createdAt: string, updatedAt: string } };

export type UpdateMemberRoleMutationVariables = Exact<{
  input: UpdateMemberRoleInput;
}>;


export type UpdateMemberRoleMutation = { __typename?: 'Mutation', updateMemberRole: { __typename?: 'MemberType', id: string, userId: string, projectId: string, role: ProjectRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string } };

export type RemoveMemberMutationVariables = Exact<{
  membershipId: Scalars['ID']['input'];
}>;


export type RemoveMemberMutation = { __typename?: 'Mutation', removeMember: boolean };

export type RevokeInvitationMutationVariables = Exact<{
  invitationId: Scalars['ID']['input'];
}>;


export type RevokeInvitationMutation = { __typename?: 'Mutation', revokeInvitation: boolean };

export type AcceptInvitationMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type AcceptInvitationMutation = { __typename?: 'Mutation', acceptInvitation: { __typename?: 'MemberType', id: string, userId: string, projectId: string, role: ProjectRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string } };

export type CreateFeatureMutationVariables = Exact<{
  input: CreateFeatureInput;
}>;


export type CreateFeatureMutation = { __typename?: 'Mutation', createFeature: { __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, tags: Array<string>, createdAt: string, updatedAt: string } };

export type AssignPrToFeatureMutationVariables = Exact<{
  input: AssignPrToFeatureInput;
}>;


export type AssignPrToFeatureMutation = { __typename?: 'Mutation', assignPrToFeature: boolean };

export type SetFeatureStateMutationVariables = Exact<{
  input: SetFeatureStateInput;
}>;


export type SetFeatureStateMutation = { __typename?: 'Mutation', setFeatureState: { __typename?: 'FeatureType', id: string, currentState: FeatureState, updatedAt: string } };

export type SetFeatureTagsMutationVariables = Exact<{
  input: SetFeatureTagsInput;
}>;


export type SetFeatureTagsMutation = { __typename?: 'Mutation', setFeatureTags: { __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, tags: Array<string>, createdAt: string, updatedAt: string } };

export type DeleteFeatureMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteFeatureMutation = { __typename?: 'Mutation', deleteFeature: boolean };

export type ListFeaturesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ListFeaturesQuery = { __typename?: 'Query', listFeatures: Array<{ __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, suggested: boolean, tags: Array<string>, currentState: FeatureState, createdAt: string, updatedAt: string }> };

export type GetFeatureQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFeatureQuery = { __typename?: 'Query', getFeature: { __typename?: 'FeatureDetailType', feature: { __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, suggested: boolean, tags: Array<string>, currentState: FeatureState, createdAt: string, updatedAt: string }, releases: Array<{ __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, createdAt: string }>, prs: Array<{ __typename?: 'PullRequestType', id: string, number: number, title: string, author: string, mergedAt: string, releaseId: string | null, body: string | null, tickets: Array<{ __typename?: 'TicketLinkType', issueId: string, source: TicketSource, url: string, title: string, confidence: number }>, commits: Array<{ __typename?: 'CommitType', sha: string, message: string, author: string, date: string }> }>, snapshots: Array<{ __typename?: 'FeatureReleaseSnapshotType', releaseId: string, state: FeatureState }> } };

export type GetFlagsQueryVariables = Exact<{
  input: GetFlagsInput;
}>;


export type GetFlagsQuery = { __typename?: 'Query', getFlags: { __typename?: 'FlagsResultType', environments: Array<string>, totalCount: number, items: Array<{ __typename?: 'FlagRefType', key: string, createdAt: string | null, environments: Array<{ __typename?: 'FlagEnvironmentStateType', name: string, enabled: boolean }> }> } };

export type CompareFlagsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  baselineEnvironments: Array<Scalars['String']['input']> | Scalars['String']['input'];
  comparedEnvironments: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type CompareFlagsQuery = { __typename?: 'Query', compareFlags: { __typename?: 'FlagComparisonResultType', baselineEnvironments: Array<string>, comparedEnvironments: Array<string>, items: Array<{ __typename?: 'FlagComparisonRowType', key: string, createdAt: string | null, baselineEnabled: boolean | null, baselineConflict: boolean, baseline: Array<{ __typename?: 'FlagEnvironmentStateType', name: string, enabled: boolean }>, divergences: Array<{ __typename?: 'FlagEnvironmentStateType', name: string, enabled: boolean }> }> } };

export type GithubRepositoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GithubRepositoriesQuery = { __typename?: 'Query', githubRepositories: Array<{ __typename?: 'GithubRepositoryType', fullName: string, name: string, owner: string, private: boolean, defaultBranch: string, description: string | null, htmlUrl: string }> };

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'ProjectType', id: string, name: string, repo: string } };

export type CreateReleaseMutationVariables = Exact<{
  input: CreateReleaseInput;
}>;


export type CreateReleaseMutation = { __typename?: 'Mutation', createRelease: { __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, projectId: string, createdAt: string } };

export type CreateGithubBranchMutationVariables = Exact<{
  input: CreateGithubBranchInput;
}>;


export type CreateGithubBranchMutation = { __typename?: 'Mutation', createGithubBranch: { __typename?: 'GithubBranchType', name: string, commitSha: string, protected: boolean } };

export type ShipReleaseMutationVariables = Exact<{
  input: ShipReleaseInput;
}>;


export type ShipReleaseMutation = { __typename?: 'Mutation', shipRelease: { __typename?: 'ReleaseObjectType', id: string, name: string | null, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, projectId: string } };

export type UpdateReleaseMutationVariables = Exact<{
  input: UpdateReleaseInput;
}>;


export type UpdateReleaseMutation = { __typename?: 'Mutation', updateRelease: { __typename?: 'ReleaseObjectType', id: string, name: string | null, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, aiDraftStatus: AiDraftStatus, projectId: string } };

export type ConfirmReleaseMutationVariables = Exact<{
  input: ConfirmReleaseInput;
}>;


export type ConfirmReleaseMutation = { __typename?: 'Mutation', confirmRelease: { __typename?: 'ReleaseObjectType', id: string, name: string | null, status: ReleaseStatus, prUrl: string | null, projectId: string } };

export type AcceptSuggestedFeatureMutationVariables = Exact<{
  input: AcceptSuggestedFeatureInput;
}>;


export type AcceptSuggestedFeatureMutation = { __typename?: 'Mutation', acceptSuggestedFeature: { __typename?: 'FeatureType', id: string, name: string, description: string, kind: FeatureKind, suggested: boolean, tags: Array<string>, projectId: string } };

export type RejectSuggestedFeatureMutationVariables = Exact<{
  input: RejectSuggestedFeatureInput;
}>;


export type RejectSuggestedFeatureMutation = { __typename?: 'Mutation', rejectSuggestedFeature: boolean };

export type SaveReleaseSummaryMutationVariables = Exact<{
  input: SaveReleaseSummaryInput;
}>;


export type SaveReleaseSummaryMutation = { __typename?: 'Mutation', saveReleaseSummary: { __typename?: 'ReleaseObjectType', id: string, summary: string | null, summaryEditedAt: string | null } };

export type GeneratePrSummaryMutationVariables = Exact<{
  prId: Scalars['ID']['input'];
}>;


export type GeneratePrSummaryMutation = { __typename?: 'Mutation', generatePrSummary: { __typename?: 'PullRequestType', id: string, summary: string | null, summaryEditedAt: string | null } };

export type SavePrSummaryMutationVariables = Exact<{
  input: SavePrSummaryInput;
}>;


export type SavePrSummaryMutation = { __typename?: 'Mutation', savePrSummary: { __typename?: 'PullRequestType', id: string, summary: string | null, summaryEditedAt: string | null } };

export type DeleteReleaseMutationVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type DeleteReleaseMutation = { __typename?: 'Mutation', deleteRelease: { __typename?: 'ReleaseObjectType', id: string } };

export type RegenerateDraftMutationVariables = Exact<{
  releaseId: Scalars['ID']['input'];
  resume: Scalars['Boolean']['input'];
}>;


export type RegenerateDraftMutation = { __typename?: 'Mutation', regenerateDraft: { __typename?: 'ReleaseObjectType', id: string, aiDraftStatus: AiDraftStatus } };

export type SetReleaseStatusMutationVariables = Exact<{
  input: SetReleaseStatusInput;
}>;


export type SetReleaseStatusMutation = { __typename?: 'Mutation', setReleaseStatus: { __typename?: 'ReleaseObjectType', id: string, status: ReleaseStatus } };

export type GetReleasesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetReleasesQuery = { __typename?: 'Query', getReleases: Array<{ __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, projectId: string, createdAt: string, updatedAt: string }> };

export type GetReleaseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetReleaseQuery = { __typename?: 'Query', getRelease: { __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, projectId: string, createdAt: string, updatedAt: string } };

export type GetReleaseTreeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetReleaseTreeQuery = { __typename?: 'Query', getReleaseTree: { __typename?: 'ReleaseTreeType', release: { __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, summary: string | null, summaryEditedAt: string | null, aiDraftStatus: AiDraftStatus, projectId: string, createdAt: string, updatedAt: string }, features: Array<{ __typename?: 'ReleaseFeatureNodeType', state: FeatureState, clientAvailabilityKey: string, feature: { __typename?: 'FeatureType', id: string, name: string, description: string, kind: FeatureKind, suggested: boolean, currentState: FeatureState, tags: Array<string> }, flagState: { __typename?: 'FlagStateType', staging: boolean, production: boolean } | null, prs: Array<{ __typename?: 'PullRequestType', id: string, number: number, title: string, url: string, body: string | null, author: string, mergedAt: string, releaseId: string | null, featureId: string | null, aiConfidence: number | null, aiRationale: string | null, summary: string | null, summaryEditedAt: string | null, tickets: Array<{ __typename?: 'TicketLinkType', issueId: string, source: TicketSource, url: string, title: string, description: string | null, confidence: number }>, commits: Array<{ __typename?: 'CommitType', sha: string, message: string, author: string, date: string }> }> }> } };

export type GetCoverageQueryVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type GetCoverageQuery = { __typename?: 'Query', getCoverage: { __typename?: 'CoverageType', total: number, assigned: number, ready: boolean } };

export type ExportSummaryQueryVariables = Exact<{
  input: ExportSummaryInput;
}>;


export type ExportSummaryQuery = { __typename?: 'Query', exportSummary: { __typename?: 'ExportResultType', url: string, filename: string } };

export type SuggestFeatureForPrQueryVariables = Exact<{
  prId: Scalars['ID']['input'];
}>;


export type SuggestFeatureForPrQuery = { __typename?: 'Query', suggestFeatureForPr: { __typename?: 'AiSuggestionType', featureId: string, confidence: number, rationale: string } };

export type GenerateSummarySubscriptionVariables = Exact<{
  input: GenerateSummaryInput;
}>;


export type GenerateSummarySubscription = { __typename?: 'Subscription', generateSummary: { __typename?: 'SummaryChunkType', chunk: string, done: boolean } };

export type GithubBranchesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GithubBranchesQuery = { __typename?: 'Query', githubBranches: Array<{ __typename?: 'GithubBranchType', name: string, protected: boolean, commitSha: string }> };

export type CompareRefsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  baseRef: Scalars['String']['input'];
  compareRef: Scalars['String']['input'];
}>;


export type CompareRefsQuery = { __typename?: 'Query', compareRefs: { __typename?: 'RefComparisonType', aheadBy: number, behindBy: number, totalCommits: number, commits: Array<{ __typename?: 'RefCommitType', sha: string, message: string, author: string, committedAt: string }> } };

export type DiffRefsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  baseRef: Scalars['String']['input'];
  compareRef: Scalars['String']['input'];
}>;


export type DiffRefsQuery = { __typename?: 'Query', diffRefs: Array<{ __typename?: 'PullRequestType', id: string, number: number, title: string, body: string | null, author: string, mergedAt: string, releaseId: string | null, featureId: string | null, tickets: Array<{ __typename?: 'TicketLinkType', issueId: string, source: TicketSource, url: string, title: string, confidence: number }>, commits: Array<{ __typename?: 'CommitType', sha: string, message: string, author: string, date: string }> }> };

export type GetConnectionSettingsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetConnectionSettingsQuery = { __typename?: 'Query', getConnectionSettings: { __typename?: 'ConnectionSettingsType', githubConnected: boolean, flagsmithConnected: boolean, flagsmithUrl: string | null, flagsmithProjectId: string | null, linearConnected: boolean } };

export type FlagsmithProjectsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  url: Scalars['String']['input'];
  apiKey: Scalars['String']['input'];
}>;


export type FlagsmithProjectsQuery = { __typename?: 'Query', flagsmithProjects: Array<{ __typename?: 'FlagsmithProjectType', id: string, name: string }> };

export type UpdateConnectionSettingsMutationVariables = Exact<{
  input: UpdateConnectionSettingsInput;
}>;


export type UpdateConnectionSettingsMutation = { __typename?: 'Mutation', updateConnectionSettings: { __typename?: 'ConnectionSettingsType', githubConnected: boolean, flagsmithConnected: boolean, flagsmithUrl: string | null, flagsmithProjectId: string | null, linearConnected: boolean } };

export type ProjectTagsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectTagsQuery = { __typename?: 'Query', projectTags: Array<{ __typename?: 'ProjectTagType', id: string, name: string, color: string | null, createdAt: string }> };

export type CreateProjectTagMutationVariables = Exact<{
  input: CreateProjectTagInput;
}>;


export type CreateProjectTagMutation = { __typename?: 'Mutation', createProjectTag: { __typename?: 'ProjectTagType', id: string, name: string, color: string | null, createdAt: string } };

export type DeleteProjectTagMutationVariables = Exact<{
  input: DeleteProjectTagInput;
}>;


export type DeleteProjectTagMutation = { __typename?: 'Mutation', deleteProjectTag: boolean };

export type GithubConnectionQueryVariables = Exact<{ [key: string]: never; }>;


export type GithubConnectionQuery = { __typename?: 'Query', githubConnection: { __typename?: 'GithubConnectionStatus', connected: boolean, githubLogin: string | null } };

export type GithubAuthorizeUrlQueryVariables = Exact<{ [key: string]: never; }>;


export type GithubAuthorizeUrlQuery = { __typename?: 'Query', githubAuthorizeUrl: string };

export type DisconnectGithubMutationVariables = Exact<{ [key: string]: never; }>;


export type DisconnectGithubMutation = { __typename?: 'Mutation', disconnectGithub: boolean };

export type ReauthorizeGithubMutationVariables = Exact<{ [key: string]: never; }>;


export type ReauthorizeGithubMutation = { __typename?: 'Mutation', reauthorizeGithub: boolean };

export type LinearConnectionQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type LinearConnectionQuery = { __typename?: 'Query', linearConnection: { __typename?: 'LinearConnectionStatus', connected: boolean, linearUser: string | null } };

export type LinearAuthorizeUrlQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type LinearAuthorizeUrlQuery = { __typename?: 'Query', linearAuthorizeUrl: string };

export type DisconnectLinearMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type DisconnectLinearMutation = { __typename?: 'Mutation', disconnectLinear: boolean };

export type VerifyFlagsmithConnectionQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  url: Scalars['String']['input'];
  apiKey: Scalars['String']['input'];
  flagsmithProjectId: Scalars['String']['input'];
}>;


export type VerifyFlagsmithConnectionQuery = { __typename?: 'Query', verifyFlagsmithConnection: { __typename?: 'FlagsmithVerifyResult', ok: boolean, projectName: string | null, environments: Array<string>, hasStaging: boolean, hasProduction: boolean, warnings: Array<string>, message: string | null } };

export type ListProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListProjectsQuery = { __typename?: 'Query', listProjects: Array<{ __typename?: 'ProjectType', id: string, name: string, repo: string, connectionHealth: { __typename?: 'ConnectionHealthType', github: IntegrationStatus, linear: IntegrationStatus, flagsmith: IntegrationStatus }, integrations: { __typename?: 'ProjectIntegrationsType', github: boolean, linear: boolean, flagsmith: boolean } }> };

export type GetProjectQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetProjectQuery = { __typename?: 'Query', getProject: { __typename?: 'ProjectType', id: string, name: string, repo: string, connectionHealth: { __typename?: 'ConnectionHealthType', github: IntegrationStatus, linear: IntegrationStatus, flagsmith: IntegrationStatus }, integrations: { __typename?: 'ProjectIntegrationsType', github: boolean, linear: boolean, flagsmith: boolean } } };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const RequestLoginCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestLoginCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestLoginCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestLoginCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RequestLoginCodeMutation, RequestLoginCodeMutationVariables>;
export const LoginWithCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginWithCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginWithCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginWithCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<LoginWithCodeMutation, LoginWithCodeMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const ListMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ListMembersQuery, ListMembersQueryVariables>;
export const ListInvitationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListInvitations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listInvitations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"invitedById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ListInvitationsQuery, ListInvitationsQueryVariables>;
export const InviteMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InviteMemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"invitedById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<InviteMemberMutation, InviteMemberMutationVariables>;
export const UpdateMemberRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMemberRoleMutation, UpdateMemberRoleMutationVariables>;
export const RemoveMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}}]}]}}]} as unknown as DocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const RevokeInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invitationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"invitationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invitationId"}}}]}]}}]} as unknown as DocumentNode<RevokeInvitationMutation, RevokeInvitationMutationVariables>;
export const AcceptInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AcceptInvitationMutation, AcceptInvitationMutationVariables>;
export const CreateFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateFeatureMutation, CreateFeatureMutationVariables>;
export const AssignPrToFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignPrToFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignPrToFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignPrToFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AssignPrToFeatureMutation, AssignPrToFeatureMutationVariables>;
export const SetFeatureStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFeatureState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFeatureStateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFeatureState"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetFeatureStateMutation, SetFeatureStateMutationVariables>;
export const SetFeatureTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFeatureTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFeatureTagsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFeatureTags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetFeatureTagsMutation, SetFeatureTagsMutationVariables>;
export const DeleteFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFeatureMutation, DeleteFeatureMutationVariables>;
export const ListFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListFeatures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listFeatures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ListFeaturesQuery, ListFeaturesQueryVariables>;
export const GetFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"releases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"snapshots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]} as unknown as DocumentNode<GetFeatureQuery, GetFeatureQueryVariables>;
export const GetFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetFlagsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"environments"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"environments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFlagsQuery, GetFlagsQueryVariables>;
export const CompareFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompareFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baselineEnvironments"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comparedEnvironments"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"compareFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"baselineEnvironments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baselineEnvironments"}}},{"kind":"Argument","name":{"kind":"Name","value":"comparedEnvironments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comparedEnvironments"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"baselineEnvironments"}},{"kind":"Field","name":{"kind":"Name","value":"comparedEnvironments"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"baselineEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"baselineConflict"}},{"kind":"Field","name":{"kind":"Name","value":"baseline"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}},{"kind":"Field","name":{"kind":"Name","value":"divergences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CompareFlagsQuery, CompareFlagsQueryVariables>;
export const GithubRepositoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GithubRepositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubRepositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"private"}},{"kind":"Field","name":{"kind":"Name","value":"defaultBranch"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"htmlUrl"}}]}}]}}]} as unknown as DocumentNode<GithubRepositoriesQuery, GithubRepositoriesQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const CreateReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateReleaseMutation, CreateReleaseMutationVariables>;
export const CreateGithubBranchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGithubBranch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGithubBranchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGithubBranch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commitSha"}},{"kind":"Field","name":{"kind":"Name","value":"protected"}}]}}]}}]} as unknown as DocumentNode<CreateGithubBranchMutation, CreateGithubBranchMutationVariables>;
export const ShipReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ShipRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ShipReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<ShipReleaseMutation, ShipReleaseMutationVariables>;
export const UpdateReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"aiDraftStatus"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<UpdateReleaseMutation, UpdateReleaseMutationVariables>;
export const ConfirmReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConfirmReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<ConfirmReleaseMutation, ConfirmReleaseMutationVariables>;
export const AcceptSuggestedFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptSuggestedFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcceptSuggestedFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptSuggestedFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<AcceptSuggestedFeatureMutation, AcceptSuggestedFeatureMutationVariables>;
export const RejectSuggestedFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectSuggestedFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RejectSuggestedFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectSuggestedFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RejectSuggestedFeatureMutation, RejectSuggestedFeatureMutationVariables>;
export const SaveReleaseSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveReleaseSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveReleaseSummaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveReleaseSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}}]}}]}}]} as unknown as DocumentNode<SaveReleaseSummaryMutation, SaveReleaseSummaryMutationVariables>;
export const GeneratePrSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GeneratePrSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generatePrSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}}]}}]}}]} as unknown as DocumentNode<GeneratePrSummaryMutation, GeneratePrSummaryMutationVariables>;
export const SavePrSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SavePrSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SavePrSummaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savePrSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}}]}}]}}]} as unknown as DocumentNode<SavePrSummaryMutation, SavePrSummaryMutationVariables>;
export const DeleteReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteReleaseMutation, DeleteReleaseMutationVariables>;
export const RegenerateDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegenerateDraft"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resume"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regenerateDraft"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"resume"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resume"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"aiDraftStatus"}}]}}]}}]} as unknown as DocumentNode<RegenerateDraftMutation, RegenerateDraftMutationVariables>;
export const SetReleaseStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetReleaseStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetReleaseStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setReleaseStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SetReleaseStatusMutation, SetReleaseStatusMutationVariables>;
export const GetReleasesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReleases"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReleases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetReleasesQuery, GetReleasesQueryVariables>;
export const GetReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetReleaseQuery, GetReleaseQueryVariables>;
export const GetReleaseTreeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReleaseTree"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReleaseTree"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"release"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}},{"kind":"Field","name":{"kind":"Name","value":"aiDraftStatus"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"clientAvailabilityKey"}},{"kind":"Field","name":{"kind":"Name","value":"flagState"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staging"}},{"kind":"Field","name":{"kind":"Name","value":"production"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"featureId"}},{"kind":"Field","name":{"kind":"Name","value":"aiConfidence"}},{"kind":"Field","name":{"kind":"Name","value":"aiRationale"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetReleaseTreeQuery, GetReleaseTreeQueryVariables>;
export const GetCoverageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCoverage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCoverage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"assigned"}},{"kind":"Field","name":{"kind":"Name","value":"ready"}}]}}]}}]} as unknown as DocumentNode<GetCoverageQuery, GetCoverageQueryVariables>;
export const ExportSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExportSummaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}}]}}]}}]} as unknown as DocumentNode<ExportSummaryQuery, ExportSummaryQueryVariables>;
export const SuggestFeatureForPrDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SuggestFeatureForPr"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggestFeatureForPr"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featureId"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"rationale"}}]}}]}}]} as unknown as DocumentNode<SuggestFeatureForPrQuery, SuggestFeatureForPrQueryVariables>;
export const GenerateSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GenerateSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenerateSummaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chunk"}},{"kind":"Field","name":{"kind":"Name","value":"done"}}]}}]}}]} as unknown as DocumentNode<GenerateSummarySubscription, GenerateSummarySubscriptionVariables>;
export const GithubBranchesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GithubBranches"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubBranches"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"protected"}},{"kind":"Field","name":{"kind":"Name","value":"commitSha"}}]}}]}}]} as unknown as DocumentNode<GithubBranchesQuery, GithubBranchesQueryVariables>;
export const CompareRefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompareRefs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"compareRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"compareRefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"baseRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseRef"}}},{"kind":"Argument","name":{"kind":"Name","value":"compareRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"compareRef"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aheadBy"}},{"kind":"Field","name":{"kind":"Name","value":"behindBy"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommits"}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CompareRefsQuery, CompareRefsQueryVariables>;
export const DiffRefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiffRefs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"compareRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffRefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"baseRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseRef"}}},{"kind":"Argument","name":{"kind":"Name","value":"compareRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"compareRef"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"featureId"}},{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]}}]} as unknown as DocumentNode<DiffRefsQuery, DiffRefsQueryVariables>;
export const GetConnectionSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConnectionSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConnectionSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithUrl"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithProjectId"}},{"kind":"Field","name":{"kind":"Name","value":"linearConnected"}}]}}]}}]} as unknown as DocumentNode<GetConnectionSettingsQuery, GetConnectionSettingsQueryVariables>;
export const FlagsmithProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FlagsmithProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagsmithProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<FlagsmithProjectsQuery, FlagsmithProjectsQueryVariables>;
export const UpdateConnectionSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateConnectionSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConnectionSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConnectionSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithUrl"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithProjectId"}},{"kind":"Field","name":{"kind":"Name","value":"linearConnected"}}]}}]}}]} as unknown as DocumentNode<UpdateConnectionSettingsMutation, UpdateConnectionSettingsMutationVariables>;
export const ProjectTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectTags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ProjectTagsQuery, ProjectTagsQueryVariables>;
export const CreateProjectTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProjectTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectTagInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProjectTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateProjectTagMutation, CreateProjectTagMutationVariables>;
export const DeleteProjectTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProjectTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteProjectTagInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProjectTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectTagMutation, DeleteProjectTagMutationVariables>;
export const GithubConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GithubConnection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubConnection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"connected"}},{"kind":"Field","name":{"kind":"Name","value":"githubLogin"}}]}}]}}]} as unknown as DocumentNode<GithubConnectionQuery, GithubConnectionQueryVariables>;
export const GithubAuthorizeUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GithubAuthorizeUrl"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubAuthorizeUrl"}}]}}]} as unknown as DocumentNode<GithubAuthorizeUrlQuery, GithubAuthorizeUrlQueryVariables>;
export const DisconnectGithubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisconnectGithub"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disconnectGithub"}}]}}]} as unknown as DocumentNode<DisconnectGithubMutation, DisconnectGithubMutationVariables>;
export const ReauthorizeGithubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReauthorizeGithub"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reauthorizeGithub"}}]}}]} as unknown as DocumentNode<ReauthorizeGithubMutation, ReauthorizeGithubMutationVariables>;
export const LinearConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LinearConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linearConnection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"connected"}},{"kind":"Field","name":{"kind":"Name","value":"linearUser"}}]}}]}}]} as unknown as DocumentNode<LinearConnectionQuery, LinearConnectionQueryVariables>;
export const LinearAuthorizeUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LinearAuthorizeUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linearAuthorizeUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<LinearAuthorizeUrlQuery, LinearAuthorizeUrlQueryVariables>;
export const DisconnectLinearDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisconnectLinear"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disconnectLinear"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<DisconnectLinearMutation, DisconnectLinearMutationVariables>;
export const VerifyFlagsmithConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VerifyFlagsmithConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"flagsmithProjectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyFlagsmithConnection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}}},{"kind":"Argument","name":{"kind":"Name","value":"flagsmithProjectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"flagsmithProjectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"environments"}},{"kind":"Field","name":{"kind":"Name","value":"hasStaging"}},{"kind":"Field","name":{"kind":"Name","value":"hasProduction"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<VerifyFlagsmithConnectionQuery, VerifyFlagsmithConnectionQueryVariables>;
export const ListProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}},{"kind":"Field","name":{"kind":"Name","value":"connectionHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}},{"kind":"Field","name":{"kind":"Name","value":"integrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}}]}}]}}]} as unknown as DocumentNode<ListProjectsQuery, ListProjectsQueryVariables>;
export const GetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}},{"kind":"Field","name":{"kind":"Name","value":"connectionHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}},{"kind":"Field","name":{"kind":"Name","value":"integrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}}]}}]}}]} as unknown as DocumentNode<GetProjectQuery, GetProjectQueryVariables>;