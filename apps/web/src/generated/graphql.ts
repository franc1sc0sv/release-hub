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

export type AiSummaryStatus =
  | 'FAILED'
  | 'GENERATING'
  | 'IDLE'
  | 'READY';

export type AssignPrToFeatureInput = {
  featureId: Scalars['ID']['input'];
  prId: Scalars['ID']['input'];
};

export type AuthTokensType = {
  __typename?: 'AuthTokensType';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type BlockBranchInput = {
  branchName: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  reason: InputMaybe<Scalars['String']['input']>;
};

export type BlockedBranchType = {
  __typename?: 'BlockedBranchType';
  branchName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdById: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  projectId: Scalars['ID']['output'];
  reason: Maybe<Scalars['String']['output']>;
};

export type BranchActivityRange =
  | 'LAST_3_MONTHS'
  | 'LAST_6_MONTHS'
  | 'LAST_MONTH'
  | 'LAST_WEEK'
  | 'OVER_6_MONTHS';

export type BranchBlockReason =
  | 'DEFAULT_BRANCH'
  | 'GITHUB_PROTECTED'
  | 'MANUALLY_BLOCKED'
  | 'OPEN_PULL_REQUEST'
  | 'PROTECTED_NAME'
  | 'RECENT_ACTIVITY'
  | 'RELEASE_REFERENCED';

export type BranchCleanupCandidateType = {
  __typename?: 'BranchCleanupCandidateType';
  lastCommitDate: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  protected: Scalars['Boolean']['output'];
  signals: BranchCleanupSignalsType;
  suggested: Scalars['Boolean']['output'];
};

export type BranchCleanupPageInput = {
  activity: InputMaybe<BranchActivityRange>;
  authorFilter: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
  protection: InputMaybe<BranchProtectionFilter>;
  search: InputMaybe<Scalars['String']['input']>;
  signals: InputMaybe<Array<BranchSignalFilter>>;
  sortDirection: InputMaybe<SortDirection>;
  sortField: InputMaybe<BranchCleanupSortField>;
};

export type BranchCleanupPageItemType = {
  __typename?: 'BranchCleanupPageItemType';
  blockReasons: Array<BranchBlockReason>;
  deletable: Scalars['Boolean']['output'];
  githubProtected: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  lastCommitAt: Maybe<Scalars['DateTime']['output']>;
  lastCommitAuthorAvatarUrl: Maybe<Scalars['String']['output']>;
  lastCommitAuthorLogin: Maybe<Scalars['String']['output']>;
  lastCommitAuthorName: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  openPullRequestNumber: Maybe<Scalars['Int']['output']>;
  openPullRequestUrl: Maybe<Scalars['String']['output']>;
  overridable: Scalars['Boolean']['output'];
  signals: BranchCleanupPageSignalsType;
};

export type BranchCleanupPageSignalsType = {
  __typename?: 'BranchCleanupPageSignalsType';
  mergedViaPr: Scalars['Boolean']['output'];
  noOpenPr: Scalars['Boolean']['output'];
  unreferencedByReleases: Scalars['Boolean']['output'];
};

export type BranchCleanupPageType = {
  __typename?: 'BranchCleanupPageType';
  items: Array<BranchCleanupPageItemType>;
  totalCount: Scalars['Int']['output'];
};

export type BranchCleanupPlanDeletableType = {
  __typename?: 'BranchCleanupPlanDeletableType';
  lastCommitAt: Maybe<Scalars['DateTime']['output']>;
  lastCommitAuthorAvatarUrl: Maybe<Scalars['String']['output']>;
  lastCommitAuthorLogin: Maybe<Scalars['String']['output']>;
  lastCommitAuthorName: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type BranchCleanupPlanKeptType = {
  __typename?: 'BranchCleanupPlanKeptType';
  blockReasons: Array<BranchBlockReason>;
  name: Scalars['String']['output'];
};

export type BranchCleanupPlanType = {
  __typename?: 'BranchCleanupPlanType';
  deletable: Array<BranchCleanupPlanDeletableType>;
  kept: Array<BranchCleanupPlanKeptType>;
  totalCount: Scalars['Int']['output'];
};

export type BranchCleanupSignalsType = {
  __typename?: 'BranchCleanupSignalsType';
  blocked: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  mergedViaPr: Scalars['Boolean']['output'];
  noOpenPr: Scalars['Boolean']['output'];
  stale: Scalars['Boolean']['output'];
  unreferencedByReleases: Scalars['Boolean']['output'];
};

export type BranchCleanupSortField =
  | 'AUTHOR'
  | 'LAST_ACTIVITY'
  | 'MERGED_VIA_PR'
  | 'OPEN_PR'
  | 'PROTECTED'
  | 'UNREFERENCED';

export type BranchProtectionFilter =
  | 'PROTECTED'
  | 'UNPROTECTED';

export type BranchSignalFilter =
  | 'MERGED_VIA_PR'
  | 'OPEN_PR'
  | 'UNREFERENCED';

export type CarriedOverFlagType = {
  __typename?: 'CarriedOverFlagType';
  decidedAt: Maybe<Scalars['DateTime']['output']>;
  decidedInThisRelease: Scalars['Boolean']['output'];
  decision: ReleaseFlagDecisionType;
  deploymentStatus: FlagDeploymentStatus;
  featureId: Maybe<Scalars['ID']['output']>;
  featureName: Maybe<Scalars['String']['output']>;
  featureReleaseState: Maybe<FeatureState>;
  key: Scalars['String']['output'];
  originReleaseId: Scalars['ID']['output'];
  originReleaseName: Scalars['String']['output'];
  trackedFlagId: Scalars['ID']['output'];
};

export type CommitType = {
  __typename?: 'CommitType';
  author: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  message: Scalars['String']['output'];
  sha: Scalars['String']['output'];
};

export type CompleteGithubInstallationInput = {
  installationId: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export type ConfirmReleaseInput = {
  releaseId: Scalars['ID']['input'];
};

export type ConnectionHealthType = {
  __typename?: 'ConnectionHealthType';
  flagsmith: IntegrationStatus;
  github: IntegrationStatus;
  linear: IntegrationStatus;
  slack: IntegrationStatus;
};

export type ConnectionSettingsType = {
  __typename?: 'ConnectionSettingsType';
  flagsmithConnected: Scalars['Boolean']['output'];
  flagsmithProjectId: Maybe<Scalars['String']['output']>;
  flagsmithUrl: Maybe<Scalars['String']['output']>;
  flagsmithWebhookPath: Scalars['String']['output'];
  flagsmithWebhookSecretSet: Scalars['Boolean']['output'];
  githubConnected: Scalars['Boolean']['output'];
  githubWebhookPath: Maybe<Scalars['String']['output']>;
  githubWebhookSecretSet: Scalars['Boolean']['output'];
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

export type CreateOrganizationInput = {
  name: Scalars['String']['input'];
};

export type CreateProjectInput = {
  githubInstallationId: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId: Scalars['ID']['input'];
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

export type CreateSummaryProfileInput = {
  description: InputMaybe<Scalars['String']['input']>;
  examples: Array<SummaryProfileExampleInput>;
  name: Scalars['String']['input'];
  outputTemplate: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  rules: Array<SummaryProfileRuleInput>;
};

export type DeleteBranchOutcomeType = {
  __typename?: 'DeleteBranchOutcomeType';
  branchName: Scalars['String']['output'];
  deleted: Scalars['Boolean']['output'];
  reason: Maybe<Scalars['String']['output']>;
};

export type DeleteGithubBranchesInput = {
  branchNames: Array<Scalars['String']['input']>;
  overriddenBranchNames: InputMaybe<Array<Scalars['String']['input']>>;
  projectId: Scalars['ID']['input'];
};

export type DeleteProjectTagInput = {
  tagId: Scalars['ID']['input'];
};

export type DeleteSummaryProfileInput = {
  profileId: Scalars['ID']['input'];
};

export type DigestFrequency =
  | 'DAILY'
  | 'WEEKLY';

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
  timeline: Array<FeatureTimelineEntryType>;
};

export type FeatureInReleaseType = {
  __typename?: 'FeatureInReleaseType';
  clientAvailabilityKey: Scalars['String']['output'];
  featureId: Scalars['ID']['output'];
  flagState: Maybe<FlagStateType>;
  releaseId: Scalars['ID']['output'];
  state: FeatureState;
  updatedAt: Scalars['DateTime']['output'];
};

export type FeatureKind =
  | 'DEFAULT'
  | 'PRODUCT';

export type FeaturePageType = {
  __typename?: 'FeaturePageType';
  hasMore: Scalars['Boolean']['output'];
  items: Array<FeatureType>;
  totalCount: Scalars['Int']['output'];
};

export type FeatureReleaseSnapshotType = {
  __typename?: 'FeatureReleaseSnapshotType';
  flagState: Maybe<FlagStateType>;
  releaseId: Scalars['ID']['output'];
  state: FeatureState;
};

export type FeatureState =
  | 'BLOCKED'
  | 'COMPLETED'
  | 'FULLY_RELEASED'
  | 'IN_PROGRESS'
  | 'PARTIAL'
  | 'READY_TO_RELEASE'
  | 'SHIPPED_FLAG_OFF';

export type FeatureTimelineEntryType = {
  __typename?: 'FeatureTimelineEntryType';
  actorName: Maybe<Scalars['String']['output']>;
  flagKey: Maybe<Scalars['String']['output']>;
  fromState: Maybe<FeatureState>;
  id: Scalars['ID']['output'];
  occurredAt: Scalars['DateTime']['output'];
  releaseId: Maybe<Scalars['ID']['output']>;
  releaseName: Maybe<Scalars['String']['output']>;
  scope: FeatureTimelineScope;
  source: FeatureTimelineSource;
  toState: FeatureState;
};

export type FeatureTimelineScope =
  | 'FEATURE'
  | 'RELEASE';

export type FeatureTimelineSource =
  | 'FLAG_DECISION'
  | 'SYSTEM'
  | 'USER';

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

export type FlagActivityFilter =
  | 'ACTIVE'
  | 'INACTIVE';

export type FlagBranchPresenceDetailType = {
  __typename?: 'FlagBranchPresenceDetailType';
  branch: Scalars['String']['output'];
  firstSeenAt: Scalars['DateTime']['output'];
  lastConfirmedAt: Scalars['DateTime']['output'];
  present: Scalars['Boolean']['output'];
};

export type FlagBranchPresenceType = {
  __typename?: 'FlagBranchPresenceType';
  branch: Scalars['String']['output'];
  lastConfirmedAt: Scalars['DateTime']['output'];
  present: Scalars['Boolean']['output'];
};

export type FlagChangeAction =
  | 'added'
  | 'modified'
  | 'removed'
  | 'unchanged';

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

export type FlagCoverageSummaryType = {
  __typename?: 'FlagCoverageSummaryType';
  branchesScanned: Scalars['Int']['output'];
  flagsTracked: Scalars['Int']['output'];
  prChangesDetected: Scalars['Int']['output'];
};

export type FlagDeploymentStatus =
  | 'CONFLICT'
  | 'IN_PROGRESS'
  | 'SHIPPED_OFF'
  | 'SHIPPED_ON'
  | 'UNTRACKED';

export type FlagDetailFlagsmithEnvironmentType = {
  __typename?: 'FlagDetailFlagsmithEnvironmentType';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  value: Maybe<Scalars['String']['output']>;
};

export type FlagDetailFlagsmithType = {
  __typename?: 'FlagDetailFlagsmithType';
  environments: Array<FlagDetailFlagsmithEnvironmentType>;
  exists: Scalars['Boolean']['output'];
  lastSyncedAt: Maybe<Scalars['DateTime']['output']>;
};

export type FlagDetailType = {
  __typename?: 'FlagDetailType';
  deploymentStatus: FlagDeploymentStatus;
  flagsmith: FlagDetailFlagsmithType;
  hasConflict: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  tracked: Maybe<TrackedFlagDetailType>;
};

export type FlagEnvironmentStateType = {
  __typename?: 'FlagEnvironmentStateType';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  value: Maybe<Scalars['String']['output']>;
};

export type FlagHistoryEventEntryType = {
  __typename?: 'FlagHistoryEventEntryType';
  actorName: Maybe<Scalars['String']['output']>;
  branchName: Maybe<Scalars['String']['output']>;
  detectedFile: Maybe<Scalars['String']['output']>;
  environmentName: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  newValue: Maybe<Scalars['String']['output']>;
  occurredAt: Scalars['DateTime']['output'];
  prNumber: Maybe<Scalars['Int']['output']>;
  previousValue: Maybe<Scalars['String']['output']>;
  releaseId: Maybe<Scalars['ID']['output']>;
  releaseName: Maybe<Scalars['String']['output']>;
  source: FlagHistorySource;
  type: FlagHistoryEventType;
};

export type FlagHistoryEventType =
  | 'CONFLICT_DETECTED'
  | 'COVERAGE_SCAN'
  | 'DECISION_ENABLE_IN_RELEASE'
  | 'DECISION_IN_PROGRESS'
  | 'DECISION_SHIP_OFF'
  | 'DETECTED_DEFINITION'
  | 'DETECTED_USAGE'
  | 'FIRST_SEEN_BRANCH'
  | 'FLAG_CREATED'
  | 'FLAG_DELETED'
  | 'FLAG_DISABLED'
  | 'FLAG_ENABLED'
  | 'FLAG_VALUE_CHANGED'
  | 'REMINDER_SENT'
  | 'SYNC_COMPLETED';

export type FlagHistoryPageType = {
  __typename?: 'FlagHistoryPageType';
  items: Array<FlagHistoryEventEntryType>;
  totalCount: Scalars['Int']['output'];
};

export type FlagHistorySource =
  | 'SYNC'
  | 'SYSTEM'
  | 'USER'
  | 'WEBHOOK';

export type FlagRefType = {
  __typename?: 'FlagRefType';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  deploymentStatus: FlagDeploymentStatus;
  environments: Array<FlagEnvironmentStateType>;
  key: Scalars['String']['output'];
};

export type FlagReferenceKind =
  | 'DEFINITION'
  | 'USAGE';

export type FlagRegistryConfigType = {
  __typename?: 'FlagRegistryConfigType';
  flagRegistryBranch: Maybe<Scalars['String']['output']>;
  flagRegistryPath: Maybe<Scalars['String']['output']>;
  projectId: Scalars['ID']['output'];
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

export type FlagSyncDriftType = {
  __typename?: 'FlagSyncDriftType';
  environmentName: Scalars['String']['output'];
  flagKey: Scalars['String']['output'];
  newValue: Maybe<Scalars['String']['output']>;
  previousValue: Maybe<Scalars['String']['output']>;
};

export type FlagSyncReportType = {
  __typename?: 'FlagSyncReportType';
  addedKeys: Array<Scalars['String']['output']>;
  enabledChanges: Array<FlagSyncDriftType>;
  environmentsAdded: Array<Scalars['String']['output']>;
  flagCount: Scalars['Int']['output'];
  inSync: Scalars['Boolean']['output'];
  removedKeys: Array<Scalars['String']['output']>;
  syncedAt: Scalars['DateTime']['output'];
  valueChanges: Array<FlagSyncDriftType>;
};

export type FlagsResultType = {
  __typename?: 'FlagsResultType';
  environments: Array<Scalars['String']['output']>;
  items: Array<FlagRefType>;
  lastSyncedAt: Maybe<Scalars['DateTime']['output']>;
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

export type GetFlagHistoryInput = {
  flagKey: Scalars['String']['input'];
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
};

export type GetFlagsInput = {
  activity: InputMaybe<FlagActivityFilter>;
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
  sortDirection: InputMaybe<SortDirection>;
  sortEnvironment: InputMaybe<Scalars['String']['input']>;
  sortField: InputMaybe<FlagSortField>;
  statuses: InputMaybe<Array<FlagDeploymentStatus>>;
};

export type GithubBranchSearchItemType = {
  __typename?: 'GithubBranchSearchItemType';
  name: Scalars['String']['output'];
  protected: Scalars['Boolean']['output'];
};

export type GithubBranchSearchResultType = {
  __typename?: 'GithubBranchSearchResultType';
  hasMore: Scalars['Boolean']['output'];
  items: Array<GithubBranchSearchItemType>;
};

export type GithubBranchType = {
  __typename?: 'GithubBranchType';
  commitSha: Scalars['String']['output'];
  name: Scalars['String']['output'];
  protected: Scalars['Boolean']['output'];
};

export type GithubInstallResultType = {
  __typename?: 'GithubInstallResultType';
  connected: Scalars['Boolean']['output'];
  organizationId: Scalars['ID']['output'];
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

export type InProgressFlagReminderType = {
  __typename?: 'InProgressFlagReminderType';
  decidedAt: Maybe<Scalars['DateTime']['output']>;
  featureId: Maybe<Scalars['ID']['output']>;
  key: Scalars['String']['output'];
  releaseId: Scalars['ID']['output'];
  releaseVersion: Scalars['String']['output'];
  trackedFlagId: Scalars['ID']['output'];
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
  organizationId: Scalars['ID']['output'];
  role: OrgRole;
  status: InvitationStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type InviteMemberInput = {
  email: Scalars['String']['input'];
  organizationId: Scalars['ID']['input'];
  role: OrgRole;
};

export type LinearConnectionStatus = {
  __typename?: 'LinearConnectionStatus';
  connected: Scalars['Boolean']['output'];
  linearUser: Maybe<Scalars['String']['output']>;
};

export type ListFeaturesPageInput = {
  assignableOnly: InputMaybe<Scalars['Boolean']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
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
  organizationId: Scalars['ID']['output'];
  role: OrgRole;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptInvitation: MemberType;
  acceptSuggestedFeature: FeatureType;
  assignPrToFeature: Scalars['Boolean']['output'];
  blockBranch: BlockedBranchType;
  clearAllNotifications: Scalars['Int']['output'];
  completeGithubInstallation: GithubInstallResultType;
  confirmRelease: ReleaseObjectType;
  confirmReleaseAdditions: ReleaseObjectType;
  createFeature: FeatureType;
  createGithubBranch: GithubBranchType;
  createOrganization: OrganizationType;
  createProject: ProjectType;
  createProjectTag: ProjectTagType;
  createRelease: ReleaseObjectType;
  createSummaryProfile: SummaryProfileType;
  deleteFeature: Scalars['Boolean']['output'];
  deleteGithubBranches: Array<DeleteBranchOutcomeType>;
  deleteOrganization: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteProjectTag: Scalars['Boolean']['output'];
  deleteRelease: ReleaseObjectType;
  deleteSummaryProfile: Scalars['Boolean']['output'];
  disconnectLinear: Scalars['Boolean']['output'];
  disconnectSlack: Scalars['Boolean']['output'];
  generatePrSummary: PullRequestType;
  inviteMember: InvitationType;
  login: AuthTokensType;
  loginWithCode: AuthTokensType;
  logout: Scalars['Boolean']['output'];
  markAllNotificationsRead: Scalars['Boolean']['output'];
  markNotificationRead: Scalars['Boolean']['output'];
  refreshToken: AuthTokensType;
  regenerateDraft: ReleaseObjectType;
  register: AuthTokensType;
  rejectSuggestedFeature: Scalars['Boolean']['output'];
  removeMember: Scalars['Boolean']['output'];
  requestLoginCode: Scalars['Boolean']['output'];
  resyncReleasePullRequests: ResyncReleaseSummaryType;
  revokeInvitation: Scalars['Boolean']['output'];
  rotateFlagsmithWebhookSecret: RotateWebhookSecretResultType;
  rotateGithubWebhookSecret: ConnectionSettingsType;
  runFlagCoverage: FlagCoverageSummaryType;
  runFlagCoverageForFlag: TrackedFlagDetailType;
  savePrSummary: PullRequestType;
  saveReleaseSummary: ReleaseObjectType;
  scanReleasePullRequests: ScanReleasePullRequestsSummaryType;
  sendSlackTestMessage: SlackTestMessageResult;
  setFeatureReleaseState: FeatureInReleaseType;
  setFeatureState: FeatureType;
  setFeatureTags: FeatureType;
  setFlagRegistry: FlagRegistryConfigType;
  setReleaseFlagDecision: ReleaseFlagDecisionResultType;
  setReleaseStatus: ReleaseObjectType;
  setSlackChannel: SlackConnectionStatus;
  shipRelease: ReleaseObjectType;
  startSummaryGeneration: ReleaseObjectType;
  syncFlagsmithFlags: FlagSyncReportType;
  syncGithubDeployments: SyncGithubDeploymentsResultType;
  triggerFlagDigest: Scalars['Boolean']['output'];
  unblockBranch: Scalars['Boolean']['output'];
  updateConnectionSettings: ConnectionSettingsType;
  updateMemberRole: MemberType;
  updateNotificationPreference: NotificationPreferenceEntryType;
  updateOrganization: OrganizationType;
  updateProject: ProjectType;
  updateRelease: ReleaseObjectType;
  updateSlackNotificationSettings: SlackConnectionStatus;
  updateSummaryProfile: SummaryProfileType;
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


export type MutationBlockBranchArgs = {
  input: BlockBranchInput;
};


export type MutationCompleteGithubInstallationArgs = {
  input: CompleteGithubInstallationInput;
};


export type MutationConfirmReleaseArgs = {
  input: ConfirmReleaseInput;
};


export type MutationConfirmReleaseAdditionsArgs = {
  releaseId: Scalars['ID']['input'];
};


export type MutationCreateFeatureArgs = {
  input: CreateFeatureInput;
};


export type MutationCreateGithubBranchArgs = {
  input: CreateGithubBranchInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
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


export type MutationCreateSummaryProfileArgs = {
  input: CreateSummaryProfileInput;
};


export type MutationDeleteFeatureArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGithubBranchesArgs = {
  input: DeleteGithubBranchesInput;
};


export type MutationDeleteOrganizationArgs = {
  organizationId: Scalars['ID']['input'];
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


export type MutationDeleteSummaryProfileArgs = {
  input: DeleteSummaryProfileInput;
};


export type MutationDisconnectLinearArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationDisconnectSlackArgs = {
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


export type MutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
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


export type MutationResyncReleasePullRequestsArgs = {
  releaseId: Scalars['ID']['input'];
};


export type MutationRevokeInvitationArgs = {
  invitationId: Scalars['ID']['input'];
};


export type MutationRotateFlagsmithWebhookSecretArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationRotateGithubWebhookSecretArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationRunFlagCoverageArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationRunFlagCoverageForFlagArgs = {
  key: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationSavePrSummaryArgs = {
  input: SavePrSummaryInput;
};


export type MutationSaveReleaseSummaryArgs = {
  input: SaveReleaseSummaryInput;
};


export type MutationScanReleasePullRequestsArgs = {
  releaseId: Scalars['ID']['input'];
};


export type MutationSendSlackTestMessageArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationSetFeatureReleaseStateArgs = {
  input: SetFeatureReleaseStateInput;
};


export type MutationSetFeatureStateArgs = {
  input: SetFeatureStateInput;
};


export type MutationSetFeatureTagsArgs = {
  input: SetFeatureTagsInput;
};


export type MutationSetFlagRegistryArgs = {
  input: SetFlagRegistryInput;
};


export type MutationSetReleaseFlagDecisionArgs = {
  input: SetReleaseFlagDecisionInput;
};


export type MutationSetReleaseStatusArgs = {
  input: SetReleaseStatusInput;
};


export type MutationSetSlackChannelArgs = {
  channelId: Scalars['String']['input'];
  channelName: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationShipReleaseArgs = {
  input: ShipReleaseInput;
};


export type MutationStartSummaryGenerationArgs = {
  input: StartSummaryGenerationInput;
};


export type MutationSyncFlagsmithFlagsArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationSyncGithubDeploymentsArgs = {
  releaseId: Scalars['ID']['input'];
};


export type MutationTriggerFlagDigestArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationUnblockBranchArgs = {
  input: UnblockBranchInput;
};


export type MutationUpdateConnectionSettingsArgs = {
  input: UpdateConnectionSettingsInput;
};


export type MutationUpdateMemberRoleArgs = {
  input: UpdateMemberRoleInput;
};


export type MutationUpdateNotificationPreferenceArgs = {
  input: UpdateNotificationPreferenceInput;
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateReleaseArgs = {
  input: UpdateReleaseInput;
};


export type MutationUpdateSlackNotificationSettingsArgs = {
  notifyOnCreated: Scalars['Boolean']['input'];
  notifyOnDeployed: Scalars['Boolean']['input'];
  notifyOnShipped: Scalars['Boolean']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationUpdateSummaryProfileArgs = {
  input: UpdateSummaryProfileInput;
};

export type NotificationChannel =
  | 'EMAIL'
  | 'IN_APP'
  | 'SLACK_DM';

export type NotificationEntryType = {
  __typename?: 'NotificationEntryType';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  flagKey: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  readAt: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  type: NotificationType;
  url: Maybe<Scalars['String']['output']>;
};

export type NotificationPreferenceEntryType = {
  __typename?: 'NotificationPreferenceEntryType';
  channel: NotificationChannel;
  digestFrequency: DigestFrequency;
  enabled: Scalars['Boolean']['output'];
  notificationType: NotificationType;
};

export type NotificationType =
  | 'FLAG_CONFLICT'
  | 'FLAG_CREATED'
  | 'FLAG_DELETED'
  | 'FLAG_DIGEST'
  | 'FLAG_DISABLED'
  | 'FLAG_ENABLED'
  | 'FLAG_IN_PROGRESS_REMINDER'
  | 'FLAG_SHIP_OFF_REMINDER'
  | 'FLAG_STALENESS_ALERT'
  | 'FLAG_VALUE_CHANGED'
  | 'RELEASE_CREATED'
  | 'RELEASE_DEPLOYED'
  | 'RELEASE_SHIPPED';

export type NotificationsPageInput = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: InputMaybe<Scalars['ID']['input']>;
};

export type NotificationsPageType = {
  __typename?: 'NotificationsPageType';
  hasMore: Scalars['Boolean']['output'];
  items: Array<NotificationEntryType>;
  totalCount: Scalars['Int']['output'];
};

export type OrgRole =
  | 'member'
  | 'owner'
  | 'viewer';

export type OrganizationMemberType = {
  __typename?: 'OrganizationMemberType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  organizationId: Scalars['ID']['output'];
  role: OrgRole;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type OrganizationType = {
  __typename?: 'OrganizationType';
  githubConnected: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: OrgRole;
  slug: Maybe<Scalars['String']['output']>;
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
  slack: Scalars['Boolean']['output'];
};

export type ProjectTagType = {
  __typename?: 'ProjectTagType';
  color: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ProjectType = {
  __typename?: 'ProjectType';
  conflictEnvironments: Array<Scalars['String']['output']>;
  connectionHealth: ConnectionHealthType;
  createdAt: Scalars['DateTime']['output'];
  flagReminderIntervalDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  integrations: ProjectIntegrationsType;
  name: Scalars['String']['output'];
  organizationId: Scalars['ID']['output'];
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
  flagChanges: Array<ReleasePrFlagChangeType>;
  id: Scalars['ID']['output'];
  mergedAt: Scalars['DateTime']['output'];
  number: Scalars['Int']['output'];
  pendingAddition: Scalars['Boolean']['output'];
  releaseId: Maybe<Scalars['ID']['output']>;
  summary: Maybe<Scalars['String']['output']>;
  summaryEditedAt: Maybe<Scalars['DateTime']['output']>;
  tickets: Array<TicketLinkType>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  blockedBranches: Array<BlockedBranchType>;
  branchAuthors: Array<Scalars['String']['output']>;
  branchCleanupCandidates: Array<BranchCleanupCandidateType>;
  branchCleanupPage: BranchCleanupPageType;
  branchCleanupPlan: BranchCleanupPlanType;
  carriedOverFlags: Array<CarriedOverFlagType>;
  compareFlags: FlagComparisonResultType;
  compareRefs: RefComparisonType;
  exportSummary: ExportResultType;
  flagDetail: Maybe<FlagDetailType>;
  flagHistory: FlagHistoryPageType;
  flagRegistry: FlagRegistryConfigType;
  flagsmithEnvironments: Array<Scalars['String']['output']>;
  flagsmithProjects: Array<FlagsmithProjectType>;
  getConnectionSettings: ConnectionSettingsType;
  getCoverage: CoverageType;
  getFeature: FeatureDetailType;
  getFlags: FlagsResultType;
  getOrganization: OrganizationType;
  getProject: ProjectType;
  getRelease: ReleaseObjectType;
  getReleaseTree: ReleaseTreeType;
  getReleasesPage: ReleasesPageType;
  githubBranches: Array<GithubBranchType>;
  githubInstallUrl: Scalars['String']['output'];
  githubInstallationRepositories: Array<GithubRepositoryType>;
  inProgressFlagReminders: Array<InProgressFlagReminderType>;
  linearAuthorizeUrl: Scalars['String']['output'];
  linearConnection: LinearConnectionStatus;
  listFeaturesPage: FeaturePageType;
  listInvitations: Array<InvitationType>;
  listMembers: Array<MemberType>;
  listOrgMembers: Array<OrganizationMemberType>;
  listProjects: Array<ProjectType>;
  me: UserProfileType;
  myOrganizations: Array<OrganizationType>;
  notificationPreferences: Array<NotificationPreferenceEntryType>;
  notifications: NotificationsPageType;
  projectTags: Array<ProjectTagType>;
  releaseFlags: Array<ReleaseFlagType>;
  releasePullRequestsPage: ReleasePullRequestsPageType;
  repoFileSearch: Array<Scalars['String']['output']>;
  searchGithubBranches: GithubBranchSearchResultType;
  slackAuthorizeUrl: Scalars['String']['output'];
  slackChannels: Array<SlackChannel>;
  slackConnection: SlackConnectionStatus;
  suggestFeatureForPr: AiSuggestionType;
  summaryProfile: SummaryProfileType;
  summaryProfiles: Array<SummaryProfileType>;
  trackedFlag: Maybe<TrackedFlagDetailType>;
  trackedFlags: Array<TrackedFlagType>;
  unreadNotificationsCount: Scalars['Int']['output'];
  verifyFlagsmithConnection: FlagsmithVerifyResult;
};


export type QueryBlockedBranchesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryBranchAuthorsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryBranchCleanupCandidatesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryBranchCleanupPageArgs = {
  input: BranchCleanupPageInput;
};


export type QueryBranchCleanupPlanArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryCarriedOverFlagsArgs = {
  releaseId: Scalars['ID']['input'];
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


export type QueryExportSummaryArgs = {
  input: ExportSummaryInput;
};


export type QueryFlagDetailArgs = {
  key: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryFlagHistoryArgs = {
  input: GetFlagHistoryInput;
};


export type QueryFlagRegistryArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryFlagsmithEnvironmentsArgs = {
  projectId: Scalars['ID']['input'];
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


export type QueryGetOrganizationArgs = {
  organizationId: Scalars['ID']['input'];
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


export type QueryGetReleasesPageArgs = {
  limit?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
  projectId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubBranchesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryGithubInstallUrlArgs = {
  organizationId: InputMaybe<Scalars['String']['input']>;
  projectId: InputMaybe<Scalars['String']['input']>;
};


export type QueryGithubInstallationRepositoriesArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryInProgressFlagRemindersArgs = {
  excludeReleaseId: InputMaybe<Scalars['ID']['input']>;
  projectId: Scalars['ID']['input'];
};


export type QueryLinearAuthorizeUrlArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryLinearConnectionArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryListFeaturesPageArgs = {
  input: ListFeaturesPageInput;
};


export type QueryListInvitationsArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryListMembersArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryListOrgMembersArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryNotificationPreferencesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryNotificationsArgs = {
  input: NotificationsPageInput;
};


export type QueryProjectTagsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryReleaseFlagsArgs = {
  releaseId: Scalars['ID']['input'];
};


export type QueryReleasePullRequestsPageArgs = {
  limit?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
  releaseId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryRepoFileSearchArgs = {
  input: RepoFileSearchInput;
};


export type QuerySearchGithubBranchesArgs = {
  limit?: Scalars['Float']['input'];
  projectId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
};


export type QuerySlackAuthorizeUrlArgs = {
  projectId: Scalars['ID']['input'];
};


export type QuerySlackChannelsArgs = {
  projectId: Scalars['ID']['input'];
};


export type QuerySlackConnectionArgs = {
  projectId: Scalars['ID']['input'];
};


export type QuerySuggestFeatureForPrArgs = {
  prId: Scalars['ID']['input'];
};


export type QuerySummaryProfileArgs = {
  profileId: Scalars['ID']['input'];
};


export type QuerySummaryProfilesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryTrackedFlagArgs = {
  key: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type QueryTrackedFlagsArgs = {
  projectId: Scalars['ID']['input'];
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
  excludedFromSummary: Scalars['Boolean']['output'];
  feature: FeatureType;
  flagState: Maybe<FlagStateType>;
  prs: Array<PullRequestType>;
  state: FeatureState;
};

export type ReleaseFlagChangeType = {
  __typename?: 'ReleaseFlagChangeType';
  action: FlagChangeAction;
  detectedFile: Maybe<Scalars['String']['output']>;
  kind: FlagReferenceKind;
  prNumber: Scalars['Int']['output'];
  prTitle: Scalars['String']['output'];
  prUrl: Scalars['String']['output'];
};

export type ReleaseFlagDecisionResultType = {
  __typename?: 'ReleaseFlagDecisionResultType';
  decidedAt: Maybe<Scalars['DateTime']['output']>;
  decidedById: Maybe<Scalars['ID']['output']>;
  decision: ReleaseFlagDecisionType;
  id: Scalars['ID']['output'];
  releaseId: Scalars['ID']['output'];
  trackedFlagId: Scalars['ID']['output'];
};

export type ReleaseFlagDecisionType =
  | 'ENABLE_IN_RELEASE'
  | 'IN_PROGRESS'
  | 'SHIP_OFF';

export type ReleaseFlagType = {
  __typename?: 'ReleaseFlagType';
  changes: Array<ReleaseFlagChangeType>;
  decidedAt: Maybe<Scalars['DateTime']['output']>;
  decision: Maybe<ReleaseFlagDecisionType>;
  feature: Maybe<TrackedFlagFeatureType>;
  featureReleaseState: Maybe<FeatureState>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  suggestedFeatureState: Maybe<FeatureState>;
};

export type ReleaseObjectType = {
  __typename?: 'ReleaseObjectType';
  aiDraftStatus: AiDraftStatus;
  baseRef: Scalars['String']['output'];
  compareRef: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deployedAt: Maybe<Scalars['DateTime']['output']>;
  githubDeploymentId: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  prUrl: Maybe<Scalars['String']['output']>;
  projectId: Scalars['ID']['output'];
  status: ReleaseStatus;
  summary: Maybe<Scalars['String']['output']>;
  summaryEditedAt: Maybe<Scalars['DateTime']['output']>;
  summaryModel: Maybe<Scalars['String']['output']>;
  summaryProfileId: Maybe<Scalars['ID']['output']>;
  summaryStatus: AiSummaryStatus;
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReleasePrFlagChangeType = {
  __typename?: 'ReleasePrFlagChangeType';
  action: FlagChangeAction;
  flagKey: Scalars['String']['output'];
  kind: FlagReferenceKind;
};

export type ReleasePullRequestsPageType = {
  __typename?: 'ReleasePullRequestsPageType';
  hasMore: Scalars['Boolean']['output'];
  items: Array<PullRequestType>;
  totalCount: Scalars['Int']['output'];
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

export type ReleasesPageType = {
  __typename?: 'ReleasesPageType';
  hasMore: Scalars['Boolean']['output'];
  items: Array<ReleaseObjectType>;
  totalCount: Scalars['Int']['output'];
};

export type RepoFileSearchInput = {
  branch: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
  query: Scalars['String']['input'];
};

export type RequestLoginCodeInput = {
  email: Scalars['String']['input'];
};

export type ResyncReleaseSummaryType = {
  __typename?: 'ResyncReleaseSummaryType';
  newPrsAdded: Scalars['Int']['output'];
};

export type RotateWebhookSecretResultType = {
  __typename?: 'RotateWebhookSecretResultType';
  connectionSettings: ConnectionSettingsType;
  secret: Scalars['String']['output'];
};

export type SavePrSummaryInput = {
  prId: Scalars['String']['input'];
  summary: Scalars['String']['input'];
};

export type SaveReleaseSummaryInput = {
  releaseId: Scalars['ID']['input'];
  summary: Scalars['String']['input'];
  summaryModel: InputMaybe<Scalars['String']['input']>;
  summaryProfileId: InputMaybe<Scalars['ID']['input']>;
};

export type ScanReleasePullRequestsSummaryType = {
  __typename?: 'ScanReleasePullRequestsSummaryType';
  changesRecorded: Scalars['Int']['output'];
  flagsFound: Scalars['Int']['output'];
  prsScanned: Scalars['Int']['output'];
};

export type SetFeatureReleaseStateInput = {
  featureId: Scalars['ID']['input'];
  flagKey: InputMaybe<Scalars['String']['input']>;
  releaseId: Scalars['ID']['input'];
  state: FeatureState;
};

export type SetFeatureStateInput = {
  featureId: Scalars['ID']['input'];
  state: FeatureState;
};

export type SetFeatureTagsInput = {
  featureId: Scalars['ID']['input'];
  tags: Array<Scalars['String']['input']>;
};

export type SetFlagRegistryInput = {
  branch: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type SetReleaseFlagDecisionInput = {
  decision: ReleaseFlagDecisionType;
  releaseId: Scalars['ID']['input'];
  trackedFlagId: Scalars['ID']['input'];
};

export type SetReleaseStatusInput = {
  releaseId: Scalars['ID']['input'];
  status: ReleaseStatus;
};

export type ShipReleaseInput = {
  releaseId: Scalars['ID']['input'];
};

export type SlackChannel = {
  __typename?: 'SlackChannel';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SlackConnectionStatus = {
  __typename?: 'SlackConnectionStatus';
  channelId: Maybe<Scalars['String']['output']>;
  channelName: Maybe<Scalars['String']['output']>;
  connected: Scalars['Boolean']['output'];
  notifyOnCreated: Scalars['Boolean']['output'];
  notifyOnDeployed: Scalars['Boolean']['output'];
  notifyOnShipped: Scalars['Boolean']['output'];
  teamName: Maybe<Scalars['String']['output']>;
};

export type SlackTestMessageResult = {
  __typename?: 'SlackTestMessageResult';
  error: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type StartSummaryGenerationInput = {
  featureIds: InputMaybe<Array<Scalars['ID']['input']>>;
  model: InputMaybe<Scalars['String']['input']>;
  releaseId: Scalars['ID']['input'];
  summaryProfileId: InputMaybe<Scalars['ID']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  notificationReceived: NotificationEntryType;
};


export type SubscriptionNotificationReceivedArgs = {
  projectId: InputMaybe<Scalars['ID']['input']>;
};

export type SummaryExampleKind =
  | 'BAD'
  | 'GOOD';

export type SummaryProfileExampleInput = {
  content: Scalars['String']['input'];
  explanation: Scalars['String']['input'];
  kind: SummaryExampleKind;
};

export type SummaryProfileExampleType = {
  __typename?: 'SummaryProfileExampleType';
  content: Scalars['String']['output'];
  explanation: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  kind: SummaryExampleKind;
};

export type SummaryProfileRuleInput = {
  content: Scalars['String']['input'];
};

export type SummaryProfileRuleType = {
  __typename?: 'SummaryProfileRuleType';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type SummaryProfileType = {
  __typename?: 'SummaryProfileType';
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  examples: Array<SummaryProfileExampleType>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  outputTemplate: Maybe<Scalars['String']['output']>;
  projectId: Scalars['ID']['output'];
  rules: Array<SummaryProfileRuleType>;
  updatedAt: Scalars['DateTime']['output'];
};

export type SyncGithubDeploymentsResultType = {
  __typename?: 'SyncGithubDeploymentsResultType';
  environment: Maybe<Scalars['String']['output']>;
  githubDeploymentId: Maybe<Scalars['ID']['output']>;
  matched: Scalars['Boolean']['output'];
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

export type TrackedFlagDeliveryType = {
  __typename?: 'TrackedFlagDeliveryType';
  inDefaultBranch: Scalars['Boolean']['output'];
  shippedReleaseVersions: Array<Scalars['String']['output']>;
};

export type TrackedFlagDetailType = {
  __typename?: 'TrackedFlagDetailType';
  branchPresences: Array<FlagBranchPresenceDetailType>;
  delivery: TrackedFlagDeliveryType;
  feature: Maybe<TrackedFlagFeatureType>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  presentInCode: Scalars['Boolean']['output'];
  pullRequestChanges: Array<TrackedFlagPullRequestChangeType>;
  releases: Array<TrackedFlagReleaseType>;
};

export type TrackedFlagFeatureType = {
  __typename?: 'TrackedFlagFeatureType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type TrackedFlagPullRequestChangeType = {
  __typename?: 'TrackedFlagPullRequestChangeType';
  action: FlagChangeAction;
  detectedFile: Maybe<Scalars['String']['output']>;
  kind: FlagReferenceKind;
  prAuthor: Scalars['String']['output'];
  prMergedAt: Scalars['DateTime']['output'];
  prNumber: Scalars['Int']['output'];
  prTitle: Scalars['String']['output'];
};

export type TrackedFlagReleaseType = {
  __typename?: 'TrackedFlagReleaseType';
  date: Scalars['DateTime']['output'];
  decision: Maybe<ReleaseFlagDecisionType>;
  releaseId: Scalars['ID']['output'];
  status: ReleaseStatus;
  version: Scalars['String']['output'];
};

export type TrackedFlagType = {
  __typename?: 'TrackedFlagType';
  addedInPullRequestNumber: Maybe<Scalars['Int']['output']>;
  branchPresences: Array<FlagBranchPresenceType>;
  branchesPresentCount: Scalars['Int']['output'];
  feature: Maybe<TrackedFlagFeatureType>;
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  presentInCode: Scalars['Boolean']['output'];
};

export type UnblockBranchInput = {
  branchName: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type UpdateConnectionSettingsInput = {
  flagsmithApiKey: InputMaybe<Scalars['String']['input']>;
  flagsmithProjectId: InputMaybe<Scalars['String']['input']>;
  flagsmithUrl: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type UpdateMemberRoleInput = {
  membershipId: Scalars['ID']['input'];
  role: OrgRole;
};

export type UpdateNotificationPreferenceInput = {
  channel: NotificationChannel;
  digestFrequency: InputMaybe<DigestFrequency>;
  enabled: Scalars['Boolean']['input'];
  notificationType: NotificationType;
  projectId: Scalars['ID']['input'];
};

export type UpdateOrganizationInput = {
  name: Scalars['String']['input'];
  organizationId: Scalars['ID']['input'];
};

export type UpdateProjectInput = {
  conflictEnvironments: InputMaybe<Array<Scalars['String']['input']>>;
  flagReminderIntervalDays: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  repo: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReleaseInput = {
  prAssignments: InputMaybe<Array<PrAssignmentInput>>;
  releaseId: Scalars['ID']['input'];
  tags: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateSummaryProfileInput = {
  description: InputMaybe<Scalars['String']['input']>;
  examples: Array<SummaryProfileExampleInput>;
  name: Scalars['String']['input'];
  outputTemplate: InputMaybe<Scalars['String']['input']>;
  profileId: Scalars['ID']['input'];
  rules: Array<SummaryProfileRuleInput>;
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
  organizationId: Scalars['ID']['input'];
}>;


export type ListMembersQuery = { __typename?: 'Query', listMembers: Array<{ __typename?: 'MemberType', id: string, userId: string, organizationId: string, role: OrgRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string }> };

export type ListInvitationsQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type ListInvitationsQuery = { __typename?: 'Query', listInvitations: Array<{ __typename?: 'InvitationType', id: string, email: string, organizationId: string, role: OrgRole, status: InvitationStatus, expiresAt: string, invitedById: string, createdAt: string, updatedAt: string }> };

export type InviteMemberMutationVariables = Exact<{
  input: InviteMemberInput;
}>;


export type InviteMemberMutation = { __typename?: 'Mutation', inviteMember: { __typename?: 'InvitationType', id: string, email: string, organizationId: string, role: OrgRole, status: InvitationStatus, expiresAt: string, invitedById: string, createdAt: string, updatedAt: string } };

export type UpdateMemberRoleMutationVariables = Exact<{
  input: UpdateMemberRoleInput;
}>;


export type UpdateMemberRoleMutation = { __typename?: 'Mutation', updateMemberRole: { __typename?: 'MemberType', id: string, userId: string, organizationId: string, role: OrgRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string } };

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


export type AcceptInvitationMutation = { __typename?: 'Mutation', acceptInvitation: { __typename?: 'MemberType', id: string, userId: string, organizationId: string, role: OrgRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string } };

export type CreateFeatureMutationVariables = Exact<{
  input: CreateFeatureInput;
}>;


export type CreateFeatureMutation = { __typename?: 'Mutation', createFeature: { __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, tags: Array<string>, createdAt: string, updatedAt: string } };

export type SetFeatureStateMutationVariables = Exact<{
  input: SetFeatureStateInput;
}>;


export type SetFeatureStateMutation = { __typename?: 'Mutation', setFeatureState: { __typename?: 'FeatureType', id: string, currentState: FeatureState, updatedAt: string } };

export type SetFeatureReleaseStateMutationVariables = Exact<{
  input: SetFeatureReleaseStateInput;
}>;


export type SetFeatureReleaseStateMutation = { __typename?: 'Mutation', setFeatureReleaseState: { __typename?: 'FeatureInReleaseType', featureId: string, releaseId: string, state: FeatureState, updatedAt: string } };

export type SetFeatureTagsMutationVariables = Exact<{
  input: SetFeatureTagsInput;
}>;


export type SetFeatureTagsMutation = { __typename?: 'Mutation', setFeatureTags: { __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, tags: Array<string>, createdAt: string, updatedAt: string } };

export type DeleteFeatureMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteFeatureMutation = { __typename?: 'Mutation', deleteFeature: boolean };

export type ListFeaturesPageQueryVariables = Exact<{
  input: ListFeaturesPageInput;
}>;


export type ListFeaturesPageQuery = { __typename?: 'Query', listFeaturesPage: { __typename?: 'FeaturePageType', totalCount: number, hasMore: boolean, items: Array<{ __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, suggested: boolean, tags: Array<string>, currentState: FeatureState, createdAt: string, updatedAt: string }> } };

export type GetFeatureQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFeatureQuery = { __typename?: 'Query', getFeature: { __typename?: 'FeatureDetailType', feature: { __typename?: 'FeatureType', id: string, projectId: string, name: string, description: string, kind: FeatureKind, suggested: boolean, tags: Array<string>, currentState: FeatureState, createdAt: string, updatedAt: string }, releases: Array<{ __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, createdAt: string }>, prs: Array<{ __typename?: 'PullRequestType', id: string, number: number, title: string, author: string, mergedAt: string, releaseId: string | null, body: string | null, tickets: Array<{ __typename?: 'TicketLinkType', issueId: string, source: TicketSource, url: string, title: string, confidence: number }>, commits: Array<{ __typename?: 'CommitType', sha: string, message: string, author: string, date: string }> }>, snapshots: Array<{ __typename?: 'FeatureReleaseSnapshotType', releaseId: string, state: FeatureState, flagState: { __typename?: 'FlagStateType', staging: boolean, production: boolean } | null }>, timeline: Array<{ __typename?: 'FeatureTimelineEntryType', id: string, releaseId: string | null, releaseName: string | null, scope: FeatureTimelineScope, source: FeatureTimelineSource, fromState: FeatureState | null, toState: FeatureState, actorName: string | null, flagKey: string | null, occurredAt: string }> } };

export type SyncFlagsmithFlagsMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type SyncFlagsmithFlagsMutation = { __typename?: 'Mutation', syncFlagsmithFlags: { __typename?: 'FlagSyncReportType', flagCount: number, addedKeys: Array<string>, removedKeys: Array<string>, environmentsAdded: Array<string>, inSync: boolean, syncedAt: string, enabledChanges: Array<{ __typename?: 'FlagSyncDriftType', flagKey: string, environmentName: string, previousValue: string | null, newValue: string | null }>, valueChanges: Array<{ __typename?: 'FlagSyncDriftType', flagKey: string, environmentName: string, previousValue: string | null, newValue: string | null }> } };

export type RunFlagCoverageMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type RunFlagCoverageMutation = { __typename?: 'Mutation', runFlagCoverage: { __typename?: 'FlagCoverageSummaryType', flagsTracked: number, branchesScanned: number, prChangesDetected: number } };

export type RunFlagCoverageForFlagMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  key: Scalars['String']['input'];
}>;


export type RunFlagCoverageForFlagMutation = { __typename?: 'Mutation', runFlagCoverageForFlag: { __typename?: 'TrackedFlagDetailType', id: string, key: string, presentInCode: boolean, delivery: { __typename?: 'TrackedFlagDeliveryType', inDefaultBranch: boolean, shippedReleaseVersions: Array<string> }, feature: { __typename?: 'TrackedFlagFeatureType', id: string, name: string } | null, branchPresences: Array<{ __typename?: 'FlagBranchPresenceDetailType', branch: string, present: boolean, firstSeenAt: string, lastConfirmedAt: string }>, releases: Array<{ __typename?: 'TrackedFlagReleaseType', releaseId: string, version: string, status: ReleaseStatus, date: string, decision: ReleaseFlagDecisionType | null }>, pullRequestChanges: Array<{ __typename?: 'TrackedFlagPullRequestChangeType', prNumber: number, prTitle: string, prAuthor: string, prMergedAt: string, kind: FlagReferenceKind, action: FlagChangeAction, detectedFile: string | null }> } };

export type GetFlagsQueryVariables = Exact<{
  input: GetFlagsInput;
}>;


export type GetFlagsQuery = { __typename?: 'Query', getFlags: { __typename?: 'FlagsResultType', environments: Array<string>, totalCount: number, lastSyncedAt: string | null, items: Array<{ __typename?: 'FlagRefType', key: string, createdAt: string | null, deploymentStatus: FlagDeploymentStatus, environments: Array<{ __typename?: 'FlagEnvironmentStateType', name: string, enabled: boolean }> }> } };

export type CompareFlagsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  baselineEnvironments: Array<Scalars['String']['input']> | Scalars['String']['input'];
  comparedEnvironments: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type CompareFlagsQuery = { __typename?: 'Query', compareFlags: { __typename?: 'FlagComparisonResultType', baselineEnvironments: Array<string>, comparedEnvironments: Array<string>, items: Array<{ __typename?: 'FlagComparisonRowType', key: string, createdAt: string | null, baselineEnabled: boolean | null, baselineConflict: boolean, baseline: Array<{ __typename?: 'FlagEnvironmentStateType', name: string, enabled: boolean, value: string | null }>, divergences: Array<{ __typename?: 'FlagEnvironmentStateType', name: string, enabled: boolean, value: string | null }> }> } };

export type TrackedFlagsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type TrackedFlagsQuery = { __typename?: 'Query', trackedFlags: Array<{ __typename?: 'TrackedFlagType', id: string, key: string, presentInCode: boolean, addedInPullRequestNumber: number | null, branchesPresentCount: number, branchPresences: Array<{ __typename?: 'FlagBranchPresenceType', branch: string, present: boolean }>, feature: { __typename?: 'TrackedFlagFeatureType', id: string, name: string } | null }> };

export type GetFlagDetailQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  key: Scalars['String']['input'];
}>;


export type GetFlagDetailQuery = { __typename?: 'Query', flagDetail: { __typename?: 'FlagDetailType', key: string, deploymentStatus: FlagDeploymentStatus, hasConflict: boolean, flagsmith: { __typename?: 'FlagDetailFlagsmithType', exists: boolean, lastSyncedAt: string | null, environments: Array<{ __typename?: 'FlagDetailFlagsmithEnvironmentType', name: string, enabled: boolean, value: string | null, updatedAt: string }> }, tracked: { __typename?: 'TrackedFlagDetailType', id: string, key: string, presentInCode: boolean, delivery: { __typename?: 'TrackedFlagDeliveryType', inDefaultBranch: boolean, shippedReleaseVersions: Array<string> }, feature: { __typename?: 'TrackedFlagFeatureType', id: string, name: string } | null, releases: Array<{ __typename?: 'TrackedFlagReleaseType', releaseId: string, version: string, status: ReleaseStatus, date: string, decision: ReleaseFlagDecisionType | null }> } | null } | null };

export type GetFlagHistoryQueryVariables = Exact<{
  input: GetFlagHistoryInput;
}>;


export type GetFlagHistoryQuery = { __typename?: 'Query', flagHistory: { __typename?: 'FlagHistoryPageType', totalCount: number, items: Array<{ __typename?: 'FlagHistoryEventEntryType', id: string, type: FlagHistoryEventType, environmentName: string | null, previousValue: string | null, newValue: string | null, releaseId: string | null, releaseName: string | null, actorName: string | null, source: FlagHistorySource, occurredAt: string, branchName: string | null, prNumber: number | null, detectedFile: string | null }> } };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: boolean };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: boolean };

export type ClearAllNotificationsMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearAllNotificationsMutation = { __typename?: 'Mutation', clearAllNotifications: number };

export type NotificationsQueryVariables = Exact<{
  input: NotificationsPageInput;
}>;


export type NotificationsQuery = { __typename?: 'Query', notifications: { __typename?: 'NotificationsPageType', totalCount: number, hasMore: boolean, items: Array<{ __typename?: 'NotificationEntryType', id: string, projectId: string, projectName: string, type: NotificationType, title: string, body: string, url: string | null, flagKey: string | null, readAt: string | null, createdAt: string }> } };

export type UnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationsCountQuery = { __typename?: 'Query', unreadNotificationsCount: number };

export type NotificationReceivedSubscriptionVariables = Exact<{
  projectId: InputMaybe<Scalars['ID']['input']>;
}>;


export type NotificationReceivedSubscription = { __typename?: 'Subscription', notificationReceived: { __typename?: 'NotificationEntryType', id: string, projectId: string, projectName: string, type: NotificationType, title: string, body: string, url: string | null, flagKey: string | null, readAt: string | null, createdAt: string } };

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'ProjectType', id: string, name: string, repo: string } };

export type MyOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOrganizationsQuery = { __typename?: 'Query', myOrganizations: Array<{ __typename?: 'OrganizationType', id: string, name: string, role: OrgRole, slug: string | null, githubConnected: boolean }> };

export type GetOrganizationQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type GetOrganizationQuery = { __typename?: 'Query', getOrganization: { __typename?: 'OrganizationType', id: string, name: string, role: OrgRole, slug: string | null, githubConnected: boolean } };

export type ListOrgMembersQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type ListOrgMembersQuery = { __typename?: 'Query', listOrgMembers: Array<{ __typename?: 'OrganizationMemberType', id: string, userId: string, organizationId: string, role: OrgRole, name: string, email: string, avatarUrl: string | null, createdAt: string, updatedAt: string }> };

export type GithubInstallationRepositoriesQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type GithubInstallationRepositoriesQuery = { __typename?: 'Query', githubInstallationRepositories: Array<{ __typename?: 'GithubRepositoryType', fullName: string, name: string, owner: string, private: boolean, defaultBranch: string, description: string | null, htmlUrl: string }> };

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization: { __typename?: 'OrganizationType', id: string, name: string, role: OrgRole, slug: string | null, githubConnected: boolean } };

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization: { __typename?: 'OrganizationType', id: string, name: string, role: OrgRole, slug: string | null, githubConnected: boolean } };

export type DeleteOrganizationMutationVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type DeleteOrganizationMutation = { __typename?: 'Mutation', deleteOrganization: boolean };

export type CreateReleaseMutationVariables = Exact<{
  input: CreateReleaseInput;
}>;


export type CreateReleaseMutation = { __typename?: 'Mutation', createRelease: { __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, projectId: string, createdAt: string } };

export type CreateGithubBranchMutationVariables = Exact<{
  input: CreateGithubBranchInput;
}>;


export type CreateGithubBranchMutation = { __typename?: 'Mutation', createGithubBranch: { __typename?: 'GithubBranchType', name: string, commitSha: string, protected: boolean } };

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


export type SaveReleaseSummaryMutation = { __typename?: 'Mutation', saveReleaseSummary: { __typename?: 'ReleaseObjectType', id: string, summary: string | null, summaryEditedAt: string | null, summaryModel: string | null, summaryProfileId: string | null } };

export type StartSummaryGenerationMutationVariables = Exact<{
  input: StartSummaryGenerationInput;
}>;


export type StartSummaryGenerationMutation = { __typename?: 'Mutation', startSummaryGeneration: { __typename?: 'ReleaseObjectType', id: string, summaryStatus: AiSummaryStatus, summaryModel: string | null, summaryProfileId: string | null } };

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

export type ScanReleasePullRequestsMutationVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type ScanReleasePullRequestsMutation = { __typename?: 'Mutation', scanReleasePullRequests: { __typename?: 'ScanReleasePullRequestsSummaryType', prsScanned: number, flagsFound: number, changesRecorded: number } };

export type ResyncReleasePullRequestsMutationVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type ResyncReleasePullRequestsMutation = { __typename?: 'Mutation', resyncReleasePullRequests: { __typename?: 'ResyncReleaseSummaryType', newPrsAdded: number } };

export type ConfirmReleaseAdditionsMutationVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type ConfirmReleaseAdditionsMutation = { __typename?: 'Mutation', confirmReleaseAdditions: { __typename?: 'ReleaseObjectType', id: string, status: ReleaseStatus } };

export type SetReleaseFlagDecisionMutationVariables = Exact<{
  input: SetReleaseFlagDecisionInput;
}>;


export type SetReleaseFlagDecisionMutation = { __typename?: 'Mutation', setReleaseFlagDecision: { __typename?: 'ReleaseFlagDecisionResultType', id: string, releaseId: string, trackedFlagId: string, decision: ReleaseFlagDecisionType, decidedAt: string | null, decidedById: string | null } };

export type GetReleasesPageQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  limit: Scalars['Float']['input'];
  offset: Scalars['Float']['input'];
  search: InputMaybe<Scalars['String']['input']>;
}>;


export type GetReleasesPageQuery = { __typename?: 'Query', getReleasesPage: { __typename?: 'ReleasesPageType', totalCount: number, hasMore: boolean, items: Array<{ __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, projectId: string, createdAt: string, updatedAt: string }> } };

export type GetReleaseTreeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetReleaseTreeQuery = { __typename?: 'Query', getReleaseTree: { __typename?: 'ReleaseTreeType', release: { __typename?: 'ReleaseObjectType', id: string, name: string | null, baseRef: string, compareRef: string, status: ReleaseStatus, tags: Array<string>, prUrl: string | null, summary: string | null, summaryEditedAt: string | null, summaryModel: string | null, summaryProfileId: string | null, aiDraftStatus: AiDraftStatus, summaryStatus: AiSummaryStatus, projectId: string, createdAt: string, updatedAt: string }, features: Array<{ __typename?: 'ReleaseFeatureNodeType', state: FeatureState, clientAvailabilityKey: string, excludedFromSummary: boolean, feature: { __typename?: 'FeatureType', id: string, name: string, description: string, kind: FeatureKind, suggested: boolean, currentState: FeatureState, tags: Array<string> }, flagState: { __typename?: 'FlagStateType', staging: boolean, production: boolean } | null, prs: Array<{ __typename?: 'PullRequestType', id: string, number: number, title: string, url: string, body: string | null, author: string, mergedAt: string, releaseId: string | null, featureId: string | null, pendingAddition: boolean, aiConfidence: number | null, aiRationale: string | null, summary: string | null, summaryEditedAt: string | null, tickets: Array<{ __typename?: 'TicketLinkType', issueId: string, source: TicketSource, url: string, title: string, description: string | null, confidence: number }>, commits: Array<{ __typename?: 'CommitType', sha: string, message: string, author: string, date: string }>, flagChanges: Array<{ __typename?: 'ReleasePrFlagChangeType', flagKey: string, action: FlagChangeAction, kind: FlagReferenceKind }> }> }> } };

export type GetCoverageQueryVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type GetCoverageQuery = { __typename?: 'Query', getCoverage: { __typename?: 'CoverageType', total: number, assigned: number, ready: boolean } };

export type SearchGithubBranchesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  search: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Float']['input'];
}>;


export type SearchGithubBranchesQuery = { __typename?: 'Query', searchGithubBranches: { __typename?: 'GithubBranchSearchResultType', hasMore: boolean, items: Array<{ __typename?: 'GithubBranchSearchItemType', name: string, protected: boolean }> } };

export type CompareRefsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  baseRef: Scalars['String']['input'];
  compareRef: Scalars['String']['input'];
}>;


export type CompareRefsQuery = { __typename?: 'Query', compareRefs: { __typename?: 'RefComparisonType', aheadBy: number, behindBy: number, totalCommits: number, commits: Array<{ __typename?: 'RefCommitType', sha: string, message: string, author: string, committedAt: string }> } };

export type CarriedOverFlagsQueryVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type CarriedOverFlagsQuery = { __typename?: 'Query', carriedOverFlags: Array<{ __typename?: 'CarriedOverFlagType', trackedFlagId: string, key: string, featureId: string | null, featureName: string | null, originReleaseId: string, originReleaseName: string, decision: ReleaseFlagDecisionType, deploymentStatus: FlagDeploymentStatus, decidedAt: string | null, decidedInThisRelease: boolean, featureReleaseState: FeatureState | null }> };

export type ReleaseFlagsQueryVariables = Exact<{
  releaseId: Scalars['ID']['input'];
}>;


export type ReleaseFlagsQuery = { __typename?: 'Query', releaseFlags: Array<{ __typename?: 'ReleaseFlagType', id: string, key: string, decision: ReleaseFlagDecisionType | null, decidedAt: string | null, suggestedFeatureState: FeatureState | null, featureReleaseState: FeatureState | null, feature: { __typename?: 'TrackedFlagFeatureType', id: string, name: string } | null, changes: Array<{ __typename?: 'ReleaseFlagChangeType', kind: FlagReferenceKind, action: FlagChangeAction, detectedFile: string | null, prNumber: number, prTitle: string, prUrl: string }> }> };

export type InProgressFlagRemindersQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  excludeReleaseId: InputMaybe<Scalars['ID']['input']>;
}>;


export type InProgressFlagRemindersQuery = { __typename?: 'Query', inProgressFlagReminders: Array<{ __typename?: 'InProgressFlagReminderType', trackedFlagId: string, key: string, releaseId: string, releaseVersion: string, decidedAt: string | null, featureId: string | null }> };

export type BlockBranchMutationVariables = Exact<{
  input: BlockBranchInput;
}>;


export type BlockBranchMutation = { __typename?: 'Mutation', blockBranch: { __typename?: 'BlockedBranchType', id: string, branchName: string, reason: string | null, createdAt: string, createdById: string, projectId: string } };

export type UnblockBranchMutationVariables = Exact<{
  input: UnblockBranchInput;
}>;


export type UnblockBranchMutation = { __typename?: 'Mutation', unblockBranch: boolean };

export type DeleteGithubBranchesMutationVariables = Exact<{
  input: DeleteGithubBranchesInput;
}>;


export type DeleteGithubBranchesMutation = { __typename?: 'Mutation', deleteGithubBranches: Array<{ __typename?: 'DeleteBranchOutcomeType', branchName: string, deleted: boolean, reason: string | null }> };

export type GetBranchCleanupPageQueryVariables = Exact<{
  input: BranchCleanupPageInput;
}>;


export type GetBranchCleanupPageQuery = { __typename?: 'Query', branchCleanupPage: { __typename?: 'BranchCleanupPageType', totalCount: number, items: Array<{ __typename?: 'BranchCleanupPageItemType', name: string, isDefault: boolean, githubProtected: boolean, lastCommitAt: string | null, lastCommitAuthorLogin: string | null, lastCommitAuthorName: string | null, lastCommitAuthorAvatarUrl: string | null, openPullRequestNumber: number | null, openPullRequestUrl: string | null, blockReasons: Array<BranchBlockReason>, deletable: boolean, overridable: boolean, signals: { __typename?: 'BranchCleanupPageSignalsType', mergedViaPr: boolean, noOpenPr: boolean, unreferencedByReleases: boolean } }> } };

export type GetBranchAuthorsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetBranchAuthorsQuery = { __typename?: 'Query', branchAuthors: Array<string> };

export type GetBranchCleanupPlanQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetBranchCleanupPlanQuery = { __typename?: 'Query', branchCleanupPlan: { __typename?: 'BranchCleanupPlanType', totalCount: number, deletable: Array<{ __typename?: 'BranchCleanupPlanDeletableType', name: string, lastCommitAt: string | null, lastCommitAuthorLogin: string | null, lastCommitAuthorName: string | null, lastCommitAuthorAvatarUrl: string | null }>, kept: Array<{ __typename?: 'BranchCleanupPlanKeptType', name: string, blockReasons: Array<BranchBlockReason> }> } };

export type GetConnectionSettingsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetConnectionSettingsQuery = { __typename?: 'Query', getConnectionSettings: { __typename?: 'ConnectionSettingsType', githubConnected: boolean, flagsmithConnected: boolean, flagsmithUrl: string | null, flagsmithProjectId: string | null, linearConnected: boolean, flagsmithWebhookPath: string, flagsmithWebhookSecretSet: boolean } };

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

export type GithubInstallUrlQueryVariables = Exact<{
  projectId: InputMaybe<Scalars['String']['input']>;
  organizationId: InputMaybe<Scalars['String']['input']>;
}>;


export type GithubInstallUrlQuery = { __typename?: 'Query', githubInstallUrl: string };

export type CompleteGithubInstallationMutationVariables = Exact<{
  input: CompleteGithubInstallationInput;
}>;


export type CompleteGithubInstallationMutation = { __typename?: 'Mutation', completeGithubInstallation: { __typename?: 'GithubInstallResultType', organizationId: string, connected: boolean } };

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

export type RepoFileSearchQueryVariables = Exact<{
  input: RepoFileSearchInput;
}>;


export type RepoFileSearchQuery = { __typename?: 'Query', repoFileSearch: Array<string> };

export type SetFlagRegistryMutationVariables = Exact<{
  input: SetFlagRegistryInput;
}>;


export type SetFlagRegistryMutation = { __typename?: 'Mutation', setFlagRegistry: { __typename?: 'FlagRegistryConfigType', projectId: string, flagRegistryPath: string | null, flagRegistryBranch: string | null } };

export type FlagRegistryQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type FlagRegistryQuery = { __typename?: 'Query', flagRegistry: { __typename?: 'FlagRegistryConfigType', projectId: string, flagRegistryPath: string | null, flagRegistryBranch: string | null } };

export type RotateFlagsmithWebhookSecretMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type RotateFlagsmithWebhookSecretMutation = { __typename?: 'Mutation', rotateFlagsmithWebhookSecret: { __typename?: 'RotateWebhookSecretResultType', secret: string, connectionSettings: { __typename?: 'ConnectionSettingsType', flagsmithWebhookPath: string, flagsmithWebhookSecretSet: boolean } } };

export type NotificationPreferencesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type NotificationPreferencesQuery = { __typename?: 'Query', notificationPreferences: Array<{ __typename?: 'NotificationPreferenceEntryType', notificationType: NotificationType, channel: NotificationChannel, enabled: boolean, digestFrequency: DigestFrequency }> };

export type UpdateNotificationPreferenceMutationVariables = Exact<{
  input: UpdateNotificationPreferenceInput;
}>;


export type UpdateNotificationPreferenceMutation = { __typename?: 'Mutation', updateNotificationPreference: { __typename?: 'NotificationPreferenceEntryType', notificationType: NotificationType, channel: NotificationChannel, enabled: boolean, digestFrequency: DigestFrequency } };

export type TriggerFlagDigestMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type TriggerFlagDigestMutation = { __typename?: 'Mutation', triggerFlagDigest: boolean };

export type GetProjectFlagReminderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetProjectFlagReminderQuery = { __typename?: 'Query', getProject: { __typename?: 'ProjectType', id: string, flagReminderIntervalDays: number } };

export type UpdateProjectFlagReminderMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectFlagReminderMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'ProjectType', id: string, flagReminderIntervalDays: number } };

export type FlagsmithEnvironmentsQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type FlagsmithEnvironmentsQuery = { __typename?: 'Query', flagsmithEnvironments: Array<string> };

export type GetProjectConflictEnvironmentsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetProjectConflictEnvironmentsQuery = { __typename?: 'Query', getProject: { __typename?: 'ProjectType', id: string, conflictEnvironments: Array<string> } };

export type UpdateProjectConflictEnvironmentsMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectConflictEnvironmentsMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'ProjectType', id: string, conflictEnvironments: Array<string> } };

export type SummaryProfilesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type SummaryProfilesQuery = { __typename?: 'Query', summaryProfiles: Array<{ __typename?: 'SummaryProfileType', id: string, projectId: string, name: string, description: string | null, outputTemplate: string | null, createdAt: string, updatedAt: string, rules: Array<{ __typename?: 'SummaryProfileRuleType', id: string, content: string }>, examples: Array<{ __typename?: 'SummaryProfileExampleType', id: string, kind: SummaryExampleKind, content: string, explanation: string }> }> };

export type SummaryProfileQueryVariables = Exact<{
  profileId: Scalars['ID']['input'];
}>;


export type SummaryProfileQuery = { __typename?: 'Query', summaryProfile: { __typename?: 'SummaryProfileType', id: string, projectId: string, name: string, description: string | null, outputTemplate: string | null, createdAt: string, updatedAt: string, rules: Array<{ __typename?: 'SummaryProfileRuleType', id: string, content: string }>, examples: Array<{ __typename?: 'SummaryProfileExampleType', id: string, kind: SummaryExampleKind, content: string, explanation: string }> } };

export type CreateSummaryProfileMutationVariables = Exact<{
  input: CreateSummaryProfileInput;
}>;


export type CreateSummaryProfileMutation = { __typename?: 'Mutation', createSummaryProfile: { __typename?: 'SummaryProfileType', id: string, projectId: string, name: string, description: string | null, outputTemplate: string | null, createdAt: string, updatedAt: string, rules: Array<{ __typename?: 'SummaryProfileRuleType', id: string, content: string }>, examples: Array<{ __typename?: 'SummaryProfileExampleType', id: string, kind: SummaryExampleKind, content: string, explanation: string }> } };

export type UpdateSummaryProfileMutationVariables = Exact<{
  input: UpdateSummaryProfileInput;
}>;


export type UpdateSummaryProfileMutation = { __typename?: 'Mutation', updateSummaryProfile: { __typename?: 'SummaryProfileType', id: string, projectId: string, name: string, description: string | null, outputTemplate: string | null, createdAt: string, updatedAt: string, rules: Array<{ __typename?: 'SummaryProfileRuleType', id: string, content: string }>, examples: Array<{ __typename?: 'SummaryProfileExampleType', id: string, kind: SummaryExampleKind, content: string, explanation: string }> } };

export type DeleteSummaryProfileMutationVariables = Exact<{
  input: DeleteSummaryProfileInput;
}>;


export type DeleteSummaryProfileMutation = { __typename?: 'Mutation', deleteSummaryProfile: boolean };

export type ListProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListProjectsQuery = { __typename?: 'Query', listProjects: Array<{ __typename?: 'ProjectType', id: string, name: string, repo: string, organizationId: string, connectionHealth: { __typename?: 'ConnectionHealthType', github: IntegrationStatus, linear: IntegrationStatus, flagsmith: IntegrationStatus }, integrations: { __typename?: 'ProjectIntegrationsType', github: boolean, linear: boolean, flagsmith: boolean } }> };

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
export const ListMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ListMembersQuery, ListMembersQueryVariables>;
export const ListInvitationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListInvitations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listInvitations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"invitedById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ListInvitationsQuery, ListInvitationsQueryVariables>;
export const InviteMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InviteMemberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"invitedById"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<InviteMemberMutation, InviteMemberMutationVariables>;
export const UpdateMemberRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMemberRoleMutation, UpdateMemberRoleMutationVariables>;
export const RemoveMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}}]}]}}]} as unknown as DocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const RevokeInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invitationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"invitationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invitationId"}}}]}]}}]} as unknown as DocumentNode<RevokeInvitationMutation, RevokeInvitationMutationVariables>;
export const AcceptInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AcceptInvitationMutation, AcceptInvitationMutationVariables>;
export const CreateFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateFeatureMutation, CreateFeatureMutationVariables>;
export const SetFeatureStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFeatureState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFeatureStateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFeatureState"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetFeatureStateMutation, SetFeatureStateMutationVariables>;
export const SetFeatureReleaseStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFeatureReleaseState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFeatureReleaseStateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFeatureReleaseState"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featureId"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetFeatureReleaseStateMutation, SetFeatureReleaseStateMutationVariables>;
export const SetFeatureTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFeatureTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFeatureTagsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFeatureTags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetFeatureTagsMutation, SetFeatureTagsMutationVariables>;
export const DeleteFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteFeatureMutation, DeleteFeatureMutationVariables>;
export const ListFeaturesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListFeaturesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ListFeaturesPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listFeaturesPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ListFeaturesPageQuery, ListFeaturesPageQueryVariables>;
export const GetFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"releases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"snapshots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"flagState"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staging"}},{"kind":"Field","name":{"kind":"Name","value":"production"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeline"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"releaseName"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"fromState"}},{"kind":"Field","name":{"kind":"Name","value":"toState"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"flagKey"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetFeatureQuery, GetFeatureQueryVariables>;
export const SyncFlagsmithFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncFlagsmithFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncFlagsmithFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagCount"}},{"kind":"Field","name":{"kind":"Name","value":"addedKeys"}},{"kind":"Field","name":{"kind":"Name","value":"removedKeys"}},{"kind":"Field","name":{"kind":"Name","value":"environmentsAdded"}},{"kind":"Field","name":{"kind":"Name","value":"enabledChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagKey"}},{"kind":"Field","name":{"kind":"Name","value":"environmentName"}},{"kind":"Field","name":{"kind":"Name","value":"previousValue"}},{"kind":"Field","name":{"kind":"Name","value":"newValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"valueChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagKey"}},{"kind":"Field","name":{"kind":"Name","value":"environmentName"}},{"kind":"Field","name":{"kind":"Name","value":"previousValue"}},{"kind":"Field","name":{"kind":"Name","value":"newValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inSync"}},{"kind":"Field","name":{"kind":"Name","value":"syncedAt"}}]}}]}}]} as unknown as DocumentNode<SyncFlagsmithFlagsMutation, SyncFlagsmithFlagsMutationVariables>;
export const RunFlagCoverageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RunFlagCoverage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runFlagCoverage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagsTracked"}},{"kind":"Field","name":{"kind":"Name","value":"branchesScanned"}},{"kind":"Field","name":{"kind":"Name","value":"prChangesDetected"}}]}}]}}]} as unknown as DocumentNode<RunFlagCoverageMutation, RunFlagCoverageMutationVariables>;
export const RunFlagCoverageForFlagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RunFlagCoverageForFlag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runFlagCoverageForFlag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"presentInCode"}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inDefaultBranch"}},{"kind":"Field","name":{"kind":"Name","value":"shippedReleaseVersions"}}]}},{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"branchPresences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"present"}},{"kind":"Field","name":{"kind":"Name","value":"firstSeenAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastConfirmedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"releases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"decision"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pullRequestChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prNumber"}},{"kind":"Field","name":{"kind":"Name","value":"prTitle"}},{"kind":"Field","name":{"kind":"Name","value":"prAuthor"}},{"kind":"Field","name":{"kind":"Name","value":"prMergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"detectedFile"}}]}}]}}]}}]} as unknown as DocumentNode<RunFlagCoverageForFlagMutation, RunFlagCoverageForFlagMutationVariables>;
export const GetFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetFlagsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"environments"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"environments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFlagsQuery, GetFlagsQueryVariables>;
export const CompareFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompareFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baselineEnvironments"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comparedEnvironments"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"compareFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"baselineEnvironments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baselineEnvironments"}}},{"kind":"Argument","name":{"kind":"Name","value":"comparedEnvironments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comparedEnvironments"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"baselineEnvironments"}},{"kind":"Field","name":{"kind":"Name","value":"comparedEnvironments"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"baselineEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"baselineConflict"}},{"kind":"Field","name":{"kind":"Name","value":"baseline"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"divergences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CompareFlagsQuery, CompareFlagsQueryVariables>;
export const TrackedFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrackedFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackedFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"presentInCode"}},{"kind":"Field","name":{"kind":"Name","value":"addedInPullRequestNumber"}},{"kind":"Field","name":{"kind":"Name","value":"branchesPresentCount"}},{"kind":"Field","name":{"kind":"Name","value":"branchPresences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"present"}}]}},{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<TrackedFlagsQuery, TrackedFlagsQueryVariables>;
export const GetFlagDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFlagDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"hasConflict"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exists"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"environments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracked"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"presentInCode"}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inDefaultBranch"}},{"kind":"Field","name":{"kind":"Name","value":"shippedReleaseVersions"}}]}},{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"releases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"decision"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFlagDetailQuery, GetFlagDetailQueryVariables>;
export const GetFlagHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFlagHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetFlagHistoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"environmentName"}},{"kind":"Field","name":{"kind":"Name","value":"previousValue"}},{"kind":"Field","name":{"kind":"Name","value":"newValue"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"releaseName"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"branchName"}},{"kind":"Field","name":{"kind":"Name","value":"prNumber"}},{"kind":"Field","name":{"kind":"Name","value":"detectedFile"}}]}}]}}]}}]} as unknown as DocumentNode<GetFlagHistoryQuery, GetFlagHistoryQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const ClearAllNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearAllNotifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearAllNotifications"}}]}}]} as unknown as DocumentNode<ClearAllNotificationsMutation, ClearAllNotificationsMutationVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationsPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"flagKey"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const UnreadNotificationsCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UnreadNotificationsCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationsCount"}}]}}]} as unknown as DocumentNode<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export const NotificationReceivedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NotificationReceived"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationReceived"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"flagKey"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<NotificationReceivedSubscription, NotificationReceivedSubscriptionVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const MyOrganizationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}}]}}]}}]} as unknown as DocumentNode<MyOrganizationsQuery, MyOrganizationsQueryVariables>;
export const GetOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationQuery, GetOrganizationQueryVariables>;
export const ListOrgMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListOrgMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listOrgMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ListOrgMembersQuery, ListOrgMembersQueryVariables>;
export const GithubInstallationRepositoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GithubInstallationRepositories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubInstallationRepositories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"private"}},{"kind":"Field","name":{"kind":"Name","value":"defaultBranch"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"htmlUrl"}}]}}]}}]} as unknown as DocumentNode<GithubInstallationRepositoriesQuery, GithubInstallationRepositoriesQueryVariables>;
export const CreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}}]}}]}}]} as unknown as DocumentNode<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const DeleteOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}]}]}}]} as unknown as DocumentNode<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>;
export const CreateReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateReleaseMutation, CreateReleaseMutationVariables>;
export const CreateGithubBranchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGithubBranch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGithubBranchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGithubBranch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commitSha"}},{"kind":"Field","name":{"kind":"Name","value":"protected"}}]}}]}}]} as unknown as DocumentNode<CreateGithubBranchMutation, CreateGithubBranchMutationVariables>;
export const UpdateReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"aiDraftStatus"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<UpdateReleaseMutation, UpdateReleaseMutationVariables>;
export const ConfirmReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConfirmReleaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<ConfirmReleaseMutation, ConfirmReleaseMutationVariables>;
export const AcceptSuggestedFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptSuggestedFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcceptSuggestedFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptSuggestedFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<AcceptSuggestedFeatureMutation, AcceptSuggestedFeatureMutationVariables>;
export const RejectSuggestedFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectSuggestedFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RejectSuggestedFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectSuggestedFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RejectSuggestedFeatureMutation, RejectSuggestedFeatureMutationVariables>;
export const SaveReleaseSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveReleaseSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveReleaseSummaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveReleaseSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}},{"kind":"Field","name":{"kind":"Name","value":"summaryModel"}},{"kind":"Field","name":{"kind":"Name","value":"summaryProfileId"}}]}}]}}]} as unknown as DocumentNode<SaveReleaseSummaryMutation, SaveReleaseSummaryMutationVariables>;
export const StartSummaryGenerationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartSummaryGeneration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartSummaryGenerationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startSummaryGeneration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summaryStatus"}},{"kind":"Field","name":{"kind":"Name","value":"summaryModel"}},{"kind":"Field","name":{"kind":"Name","value":"summaryProfileId"}}]}}]}}]} as unknown as DocumentNode<StartSummaryGenerationMutation, StartSummaryGenerationMutationVariables>;
export const GeneratePrSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GeneratePrSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generatePrSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}}]}}]}}]} as unknown as DocumentNode<GeneratePrSummaryMutation, GeneratePrSummaryMutationVariables>;
export const SavePrSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SavePrSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SavePrSummaryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savePrSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}}]}}]}}]} as unknown as DocumentNode<SavePrSummaryMutation, SavePrSummaryMutationVariables>;
export const DeleteReleaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRelease"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRelease"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteReleaseMutation, DeleteReleaseMutationVariables>;
export const RegenerateDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegenerateDraft"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"resume"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regenerateDraft"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"resume"},"value":{"kind":"Variable","name":{"kind":"Name","value":"resume"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"aiDraftStatus"}}]}}]}}]} as unknown as DocumentNode<RegenerateDraftMutation, RegenerateDraftMutationVariables>;
export const SetReleaseStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetReleaseStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetReleaseStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setReleaseStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SetReleaseStatusMutation, SetReleaseStatusMutationVariables>;
export const ScanReleasePullRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScanReleasePullRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scanReleasePullRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prsScanned"}},{"kind":"Field","name":{"kind":"Name","value":"flagsFound"}},{"kind":"Field","name":{"kind":"Name","value":"changesRecorded"}}]}}]}}]} as unknown as DocumentNode<ScanReleasePullRequestsMutation, ScanReleasePullRequestsMutationVariables>;
export const ResyncReleasePullRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResyncReleasePullRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resyncReleasePullRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newPrsAdded"}}]}}]}}]} as unknown as DocumentNode<ResyncReleasePullRequestsMutation, ResyncReleasePullRequestsMutationVariables>;
export const ConfirmReleaseAdditionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmReleaseAdditions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmReleaseAdditions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ConfirmReleaseAdditionsMutation, ConfirmReleaseAdditionsMutationVariables>;
export const SetReleaseFlagDecisionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetReleaseFlagDecision"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetReleaseFlagDecisionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setReleaseFlagDecision"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"trackedFlagId"}},{"kind":"Field","name":{"kind":"Name","value":"decision"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedById"}}]}}]}}]} as unknown as DocumentNode<SetReleaseFlagDecisionMutation, SetReleaseFlagDecisionMutationVariables>;
export const GetReleasesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReleasesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReleasesPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetReleasesPageQuery, GetReleasesPageQueryVariables>;
export const GetReleaseTreeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReleaseTree"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReleaseTree"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"release"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"baseRef"}},{"kind":"Field","name":{"kind":"Name","value":"compareRef"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}},{"kind":"Field","name":{"kind":"Name","value":"summaryModel"}},{"kind":"Field","name":{"kind":"Name","value":"summaryProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"aiDraftStatus"}},{"kind":"Field","name":{"kind":"Name","value":"summaryStatus"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"suggested"}},{"kind":"Field","name":{"kind":"Name","value":"currentState"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"clientAvailabilityKey"}},{"kind":"Field","name":{"kind":"Name","value":"excludedFromSummary"}},{"kind":"Field","name":{"kind":"Name","value":"flagState"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staging"}},{"kind":"Field","name":{"kind":"Name","value":"production"}}]}},{"kind":"Field","name":{"kind":"Name","value":"prs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"featureId"}},{"kind":"Field","name":{"kind":"Name","value":"pendingAddition"}},{"kind":"Field","name":{"kind":"Name","value":"aiConfidence"}},{"kind":"Field","name":{"kind":"Name","value":"aiRationale"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryEditedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"flagChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagKey"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetReleaseTreeQuery, GetReleaseTreeQueryVariables>;
export const GetCoverageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCoverage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCoverage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"assigned"}},{"kind":"Field","name":{"kind":"Name","value":"ready"}}]}}]}}]} as unknown as DocumentNode<GetCoverageQuery, GetCoverageQueryVariables>;
export const SearchGithubBranchesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchGithubBranches"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchGithubBranches"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"protected"}}]}}]}}]}}]} as unknown as DocumentNode<SearchGithubBranchesQuery, SearchGithubBranchesQueryVariables>;
export const CompareRefsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompareRefs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"compareRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"compareRefs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"baseRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseRef"}}},{"kind":"Argument","name":{"kind":"Name","value":"compareRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"compareRef"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aheadBy"}},{"kind":"Field","name":{"kind":"Name","value":"behindBy"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommits"}},{"kind":"Field","name":{"kind":"Name","value":"commits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CompareRefsQuery, CompareRefsQueryVariables>;
export const CarriedOverFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CarriedOverFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"carriedOverFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackedFlagId"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"featureId"}},{"kind":"Field","name":{"kind":"Name","value":"featureName"}},{"kind":"Field","name":{"kind":"Name","value":"originReleaseId"}},{"kind":"Field","name":{"kind":"Name","value":"originReleaseName"}},{"kind":"Field","name":{"kind":"Name","value":"decision"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedInThisRelease"}},{"kind":"Field","name":{"kind":"Name","value":"featureReleaseState"}}]}}]}}]} as unknown as DocumentNode<CarriedOverFlagsQuery, CarriedOverFlagsQueryVariables>;
export const ReleaseFlagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReleaseFlags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"releaseFlags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"releaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"releaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"decision"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"suggestedFeatureState"}},{"kind":"Field","name":{"kind":"Name","value":"featureReleaseState"}},{"kind":"Field","name":{"kind":"Name","value":"feature"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"changes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"detectedFile"}},{"kind":"Field","name":{"kind":"Name","value":"prNumber"}},{"kind":"Field","name":{"kind":"Name","value":"prTitle"}},{"kind":"Field","name":{"kind":"Name","value":"prUrl"}}]}}]}}]}}]} as unknown as DocumentNode<ReleaseFlagsQuery, ReleaseFlagsQueryVariables>;
export const InProgressFlagRemindersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InProgressFlagReminders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"excludeReleaseId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inProgressFlagReminders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"excludeReleaseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"excludeReleaseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackedFlagId"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"releaseId"}},{"kind":"Field","name":{"kind":"Name","value":"releaseVersion"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"featureId"}}]}}]}}]} as unknown as DocumentNode<InProgressFlagRemindersQuery, InProgressFlagRemindersQueryVariables>;
export const BlockBranchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BlockBranch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BlockBranchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockBranch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"branchName"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<BlockBranchMutation, BlockBranchMutationVariables>;
export const UnblockBranchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnblockBranch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnblockBranchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unblockBranch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UnblockBranchMutation, UnblockBranchMutationVariables>;
export const DeleteGithubBranchesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGithubBranches"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteGithubBranchesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGithubBranches"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branchName"}},{"kind":"Field","name":{"kind":"Name","value":"deleted"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]}}]} as unknown as DocumentNode<DeleteGithubBranchesMutation, DeleteGithubBranchesMutationVariables>;
export const GetBranchCleanupPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBranchCleanupPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BranchCleanupPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branchCleanupPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"githubProtected"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAuthorLogin"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAuthorName"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAuthorAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"openPullRequestNumber"}},{"kind":"Field","name":{"kind":"Name","value":"openPullRequestUrl"}},{"kind":"Field","name":{"kind":"Name","value":"blockReasons"}},{"kind":"Field","name":{"kind":"Name","value":"deletable"}},{"kind":"Field","name":{"kind":"Name","value":"overridable"}},{"kind":"Field","name":{"kind":"Name","value":"signals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mergedViaPr"}},{"kind":"Field","name":{"kind":"Name","value":"noOpenPr"}},{"kind":"Field","name":{"kind":"Name","value":"unreferencedByReleases"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetBranchCleanupPageQuery, GetBranchCleanupPageQueryVariables>;
export const GetBranchAuthorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBranchAuthors"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branchAuthors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<GetBranchAuthorsQuery, GetBranchAuthorsQueryVariables>;
export const GetBranchCleanupPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBranchCleanupPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branchCleanupPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAuthorLogin"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAuthorName"}},{"kind":"Field","name":{"kind":"Name","value":"lastCommitAuthorAvatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"kept"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"blockReasons"}}]}}]}}]}}]} as unknown as DocumentNode<GetBranchCleanupPlanQuery, GetBranchCleanupPlanQueryVariables>;
export const GetConnectionSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConnectionSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConnectionSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithUrl"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithProjectId"}},{"kind":"Field","name":{"kind":"Name","value":"linearConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithWebhookPath"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithWebhookSecretSet"}}]}}]}}]} as unknown as DocumentNode<GetConnectionSettingsQuery, GetConnectionSettingsQueryVariables>;
export const FlagsmithProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FlagsmithProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagsmithProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<FlagsmithProjectsQuery, FlagsmithProjectsQueryVariables>;
export const UpdateConnectionSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateConnectionSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConnectionSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConnectionSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithConnected"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithUrl"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithProjectId"}},{"kind":"Field","name":{"kind":"Name","value":"linearConnected"}}]}}]}}]} as unknown as DocumentNode<UpdateConnectionSettingsMutation, UpdateConnectionSettingsMutationVariables>;
export const ProjectTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectTags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ProjectTagsQuery, ProjectTagsQueryVariables>;
export const CreateProjectTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProjectTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectTagInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProjectTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateProjectTagMutation, CreateProjectTagMutationVariables>;
export const DeleteProjectTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProjectTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteProjectTagInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProjectTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteProjectTagMutation, DeleteProjectTagMutationVariables>;
export const GithubInstallUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GithubInstallUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubInstallUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}]}]}}]} as unknown as DocumentNode<GithubInstallUrlQuery, GithubInstallUrlQueryVariables>;
export const CompleteGithubInstallationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteGithubInstallation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteGithubInstallationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeGithubInstallation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"connected"}}]}}]}}]} as unknown as DocumentNode<CompleteGithubInstallationMutation, CompleteGithubInstallationMutationVariables>;
export const LinearConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LinearConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linearConnection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"connected"}},{"kind":"Field","name":{"kind":"Name","value":"linearUser"}}]}}]}}]} as unknown as DocumentNode<LinearConnectionQuery, LinearConnectionQueryVariables>;
export const LinearAuthorizeUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LinearAuthorizeUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linearAuthorizeUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<LinearAuthorizeUrlQuery, LinearAuthorizeUrlQueryVariables>;
export const DisconnectLinearDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisconnectLinear"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disconnectLinear"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<DisconnectLinearMutation, DisconnectLinearMutationVariables>;
export const VerifyFlagsmithConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VerifyFlagsmithConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"flagsmithProjectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyFlagsmithConnection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"apiKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiKey"}}},{"kind":"Argument","name":{"kind":"Name","value":"flagsmithProjectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"flagsmithProjectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"environments"}},{"kind":"Field","name":{"kind":"Name","value":"hasStaging"}},{"kind":"Field","name":{"kind":"Name","value":"hasProduction"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<VerifyFlagsmithConnectionQuery, VerifyFlagsmithConnectionQueryVariables>;
export const RepoFileSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RepoFileSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RepoFileSearchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repoFileSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RepoFileSearchQuery, RepoFileSearchQueryVariables>;
export const SetFlagRegistryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetFlagRegistry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFlagRegistryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFlagRegistry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"flagRegistryPath"}},{"kind":"Field","name":{"kind":"Name","value":"flagRegistryBranch"}}]}}]}}]} as unknown as DocumentNode<SetFlagRegistryMutation, SetFlagRegistryMutationVariables>;
export const FlagRegistryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FlagRegistry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagRegistry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"flagRegistryPath"}},{"kind":"Field","name":{"kind":"Name","value":"flagRegistryBranch"}}]}}]}}]} as unknown as DocumentNode<FlagRegistryQuery, FlagRegistryQueryVariables>;
export const RotateFlagsmithWebhookSecretDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RotateFlagsmithWebhookSecret"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rotateFlagsmithWebhookSecret"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"connectionSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagsmithWebhookPath"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmithWebhookSecretSet"}}]}}]}}]}}]} as unknown as DocumentNode<RotateFlagsmithWebhookSecretMutation, RotateFlagsmithWebhookSecretMutationVariables>;
export const NotificationPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NotificationPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationPreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationType"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"digestFrequency"}}]}}]}}]} as unknown as DocumentNode<NotificationPreferencesQuery, NotificationPreferencesQueryVariables>;
export const UpdateNotificationPreferenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNotificationPreference"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNotificationPreferenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNotificationPreference"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationType"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"digestFrequency"}}]}}]}}]} as unknown as DocumentNode<UpdateNotificationPreferenceMutation, UpdateNotificationPreferenceMutationVariables>;
export const TriggerFlagDigestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TriggerFlagDigest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"triggerFlagDigest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<TriggerFlagDigestMutation, TriggerFlagDigestMutationVariables>;
export const GetProjectFlagReminderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjectFlagReminder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"flagReminderIntervalDays"}}]}}]}}]} as unknown as DocumentNode<GetProjectFlagReminderQuery, GetProjectFlagReminderQueryVariables>;
export const UpdateProjectFlagReminderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProjectFlagReminder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"flagReminderIntervalDays"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectFlagReminderMutation, UpdateProjectFlagReminderMutationVariables>;
export const FlagsmithEnvironmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FlagsmithEnvironments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flagsmithEnvironments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}]}}]} as unknown as DocumentNode<FlagsmithEnvironmentsQuery, FlagsmithEnvironmentsQueryVariables>;
export const GetProjectConflictEnvironmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjectConflictEnvironments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conflictEnvironments"}}]}}]}}]} as unknown as DocumentNode<GetProjectConflictEnvironmentsQuery, GetProjectConflictEnvironmentsQueryVariables>;
export const UpdateProjectConflictEnvironmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProjectConflictEnvironments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conflictEnvironments"}}]}}]}}]} as unknown as DocumentNode<UpdateProjectConflictEnvironmentsMutation, UpdateProjectConflictEnvironmentsMutationVariables>;
export const SummaryProfilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SummaryProfiles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"summaryProfiles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"outputTemplate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"examples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]}}]} as unknown as DocumentNode<SummaryProfilesQuery, SummaryProfilesQueryVariables>;
export const SummaryProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SummaryProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"profileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"summaryProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"profileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"profileId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"outputTemplate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"examples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]}}]} as unknown as DocumentNode<SummaryProfileQuery, SummaryProfileQueryVariables>;
export const CreateSummaryProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSummaryProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSummaryProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSummaryProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"outputTemplate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"examples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSummaryProfileMutation, CreateSummaryProfileMutationVariables>;
export const UpdateSummaryProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSummaryProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSummaryProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSummaryProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"outputTemplate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"examples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateSummaryProfileMutation, UpdateSummaryProfileMutationVariables>;
export const DeleteSummaryProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSummaryProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteSummaryProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSummaryProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteSummaryProfileMutation, DeleteSummaryProfileMutationVariables>;
export const ListProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"connectionHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}},{"kind":"Field","name":{"kind":"Name","value":"integrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}}]}}]}}]} as unknown as DocumentNode<ListProjectsQuery, ListProjectsQueryVariables>;
export const GetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}},{"kind":"Field","name":{"kind":"Name","value":"connectionHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}},{"kind":"Field","name":{"kind":"Name","value":"integrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github"}},{"kind":"Field","name":{"kind":"Name","value":"linear"}},{"kind":"Field","name":{"kind":"Name","value":"flagsmith"}}]}}]}}]}}]} as unknown as DocumentNode<GetProjectQuery, GetProjectQueryVariables>;