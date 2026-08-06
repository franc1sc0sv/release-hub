/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation RefreshToken($input: RefreshTokenInput!) {\n    refreshToken(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": typeof types.RefreshTokenDocument,
    "\n  query Me {\n    me {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation RequestLoginCode($input: RequestLoginCodeInput!) {\n    requestLoginCode(input: $input)\n  }\n": typeof types.RequestLoginCodeDocument,
    "\n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": typeof types.LoginWithCodeDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  query ListMembers($organizationId: ID!) {\n    listMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ListMembersDocument,
    "\n  query ListInvitations($organizationId: ID!) {\n    listInvitations(organizationId: $organizationId) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ListInvitationsDocument,
    "\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.InviteMemberDocument,
    "\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateMemberRoleDocument,
    "\n  mutation RemoveMember($membershipId: ID!) {\n    removeMember(membershipId: $membershipId)\n  }\n": typeof types.RemoveMemberDocument,
    "\n  mutation RevokeInvitation($invitationId: ID!) {\n    revokeInvitation(invitationId: $invitationId)\n  }\n": typeof types.RevokeInvitationDocument,
    "\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.AcceptInvitationDocument,
    "\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateFeatureDocument,
    "\n  mutation SetFeatureState($input: SetFeatureStateInput!) {\n    setFeatureState(input: $input) {\n      id\n      currentState\n      updatedAt\n    }\n  }\n": typeof types.SetFeatureStateDocument,
    "\n  mutation SetFeatureTags($input: SetFeatureTagsInput!) {\n    setFeatureTags(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.SetFeatureTagsDocument,
    "\n  mutation DeleteFeature($id: ID!) {\n    deleteFeature(id: $id)\n  }\n": typeof types.DeleteFeatureDocument,
    "\n  query ListFeaturesPage($input: ListFeaturesPageInput!) {\n    listFeaturesPage(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.ListFeaturesPageDocument,
    "\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n        flagState {\n          staging\n          production\n        }\n      }\n    }\n  }\n": typeof types.GetFeatureDocument,
    "\n  mutation SyncFlagsmithFlags($projectId: ID!) {\n    syncFlagsmithFlags(projectId: $projectId)\n  }\n": typeof types.SyncFlagsmithFlagsDocument,
    "\n  mutation RunFlagCoverage($projectId: ID!) {\n    runFlagCoverage(projectId: $projectId) {\n      flagsTracked\n      branchesScanned\n      prChangesDetected\n    }\n  }\n": typeof types.RunFlagCoverageDocument,
    "\n  mutation RunFlagCoverageForFlag($projectId: ID!, $key: String!) {\n    runFlagCoverageForFlag(projectId: $projectId, key: $key) {\n      id\n      key\n      presentInCode\n      delivery {\n        inDefaultBranch\n        shippedReleaseVersions\n      }\n      feature {\n        id\n        name\n      }\n      branchPresences {\n        branch\n        present\n        firstSeenAt\n        lastConfirmedAt\n      }\n      releases {\n        releaseId\n        version\n        status\n        date\n        decision\n      }\n      pullRequestChanges {\n        prNumber\n        prTitle\n        prAuthor\n        prMergedAt\n        kind\n        action\n        detectedFile\n      }\n    }\n  }\n": typeof types.RunFlagCoverageForFlagDocument,
    "\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      lastSyncedAt\n      items {\n        key\n        createdAt\n        deploymentStatus\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n": typeof types.GetFlagsDocument,
    "\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled value }\n        divergences { name enabled value }\n      }\n    }\n  }\n": typeof types.CompareFlagsDocument,
    "\n  query TrackedFlags($projectId: ID!) {\n    trackedFlags(projectId: $projectId) {\n      id\n      key\n      presentInCode\n      addedInPullRequestNumber\n      branchesPresentCount\n      branchPresences {\n        branch\n        present\n      }\n      feature {\n        id\n        name\n      }\n    }\n  }\n": typeof types.TrackedFlagsDocument,
    "\n  query GetFlagDetail($projectId: ID!, $key: String!) {\n    flagDetail(projectId: $projectId, key: $key) {\n      key\n      deploymentStatus\n      hasConflict\n      flagsmith {\n        exists\n        lastSyncedAt\n        environments {\n          name\n          enabled\n          value\n          updatedAt\n        }\n      }\n      tracked {\n        id\n        key\n        presentInCode\n        delivery {\n          inDefaultBranch\n          shippedReleaseVersions\n        }\n        feature {\n          id\n          name\n        }\n        releases {\n          releaseId\n          version\n          status\n          date\n          decision\n        }\n      }\n    }\n  }\n": typeof types.GetFlagDetailDocument,
    "\n  query GetFlagHistory($input: GetFlagHistoryInput!) {\n    flagHistory(input: $input) {\n      totalCount\n      items {\n        id\n        type\n        environmentName\n        previousValue\n        newValue\n        releaseId\n        releaseName\n        actorName\n        source\n        occurredAt\n        branchName\n        prNumber\n        detectedFile\n      }\n    }\n  }\n": typeof types.GetFlagHistoryDocument,
    "\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n": typeof types.MarkNotificationReadDocument,
    "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n": typeof types.MarkAllNotificationsReadDocument,
    "\n  mutation ClearAllNotifications {\n    clearAllNotifications\n  }\n": typeof types.ClearAllNotificationsDocument,
    "\n  query Notifications($input: NotificationsPageInput!) {\n    notifications(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        projectName\n        type\n        title\n        body\n        url\n        flagKey\n        readAt\n        createdAt\n      }\n    }\n  }\n": typeof types.NotificationsDocument,
    "\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n": typeof types.UnreadNotificationsCountDocument,
    "\n  subscription NotificationReceived($projectId: ID) {\n    notificationReceived(projectId: $projectId) {\n      id\n      projectId\n      projectName\n      type\n      title\n      body\n      url\n      flagKey\n      readAt\n      createdAt\n    }\n  }\n": typeof types.NotificationReceivedDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n": typeof types.CreateProjectDocument,
    "\n  query MyOrganizations {\n    myOrganizations {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": typeof types.MyOrganizationsDocument,
    "\n  query GetOrganization($organizationId: ID!) {\n    getOrganization(organizationId: $organizationId) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": typeof types.GetOrganizationDocument,
    "\n  query ListOrgMembers($organizationId: ID!) {\n    listOrgMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ListOrgMembersDocument,
    "\n  query GithubInstallationRepositories($organizationId: ID!) {\n    githubInstallationRepositories(organizationId: $organizationId) {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n": typeof types.GithubInstallationRepositoriesDocument,
    "\n  mutation CreateOrganization($input: CreateOrganizationInput!) {\n    createOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": typeof types.CreateOrganizationDocument,
    "\n  mutation UpdateOrganization($input: UpdateOrganizationInput!) {\n    updateOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": typeof types.UpdateOrganizationDocument,
    "\n  mutation DeleteOrganization($organizationId: ID!) {\n    deleteOrganization(organizationId: $organizationId)\n  }\n": typeof types.DeleteOrganizationDocument,
    "\n  mutation CreateRelease($input: CreateReleaseInput!) {\n    createRelease(input: $input) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      projectId\n      createdAt\n    }\n  }\n": typeof types.CreateReleaseDocument,
    "\n  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {\n    createGithubBranch(input: $input) {\n      name\n      commitSha\n      protected\n    }\n  }\n": typeof types.CreateGithubBranchDocument,
    "\n  mutation UpdateRelease($input: UpdateReleaseInput!) {\n    updateRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      aiDraftStatus\n      projectId\n    }\n  }\n": typeof types.UpdateReleaseDocument,
    "\n  mutation ConfirmRelease($input: ConfirmReleaseInput!) {\n    confirmRelease(input: $input) {\n      id\n      name\n      status\n      prUrl\n      projectId\n    }\n  }\n": typeof types.ConfirmReleaseDocument,
    "\n  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {\n    acceptSuggestedFeature(input: $input) {\n      id\n      name\n      description\n      kind\n      suggested\n      tags\n      projectId\n    }\n  }\n": typeof types.AcceptSuggestedFeatureDocument,
    "\n  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {\n    rejectSuggestedFeature(input: $input)\n  }\n": typeof types.RejectSuggestedFeatureDocument,
    "\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n      summaryModel\n      summaryProfileId\n    }\n  }\n": typeof types.SaveReleaseSummaryDocument,
    "\n  mutation StartSummaryGeneration($input: StartSummaryGenerationInput!) {\n    startSummaryGeneration(input: $input) {\n      id\n      summaryStatus\n      summaryModel\n      summaryProfileId\n    }\n  }\n": typeof types.StartSummaryGenerationDocument,
    "\n  mutation GeneratePrSummary($prId: ID!) {\n    generatePrSummary(prId: $prId) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": typeof types.GeneratePrSummaryDocument,
    "\n  mutation SavePrSummary($input: SavePrSummaryInput!) {\n    savePrSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": typeof types.SavePrSummaryDocument,
    "\n  mutation DeleteRelease($releaseId: ID!) {\n    deleteRelease(releaseId: $releaseId) {\n      id\n    }\n  }\n": typeof types.DeleteReleaseDocument,
    "\n  mutation RegenerateDraft($releaseId: ID!, $resume: Boolean!) {\n    regenerateDraft(releaseId: $releaseId, resume: $resume) {\n      id\n      aiDraftStatus\n    }\n  }\n": typeof types.RegenerateDraftDocument,
    "\n  mutation SetReleaseStatus($input: SetReleaseStatusInput!) {\n    setReleaseStatus(input: $input) {\n      id\n      status\n    }\n  }\n": typeof types.SetReleaseStatusDocument,
    "\n  mutation ScanReleasePullRequests($releaseId: ID!) {\n    scanReleasePullRequests(releaseId: $releaseId) {\n      prsScanned\n      flagsFound\n      changesRecorded\n    }\n  }\n": typeof types.ScanReleasePullRequestsDocument,
    "\n  mutation ResyncReleasePullRequests($releaseId: ID!) {\n    resyncReleasePullRequests(releaseId: $releaseId) {\n      newPrsAdded\n    }\n  }\n": typeof types.ResyncReleasePullRequestsDocument,
    "\n  mutation ConfirmReleaseAdditions($releaseId: ID!) {\n    confirmReleaseAdditions(releaseId: $releaseId) {\n      id\n      status\n    }\n  }\n": typeof types.ConfirmReleaseAdditionsDocument,
    "\n  mutation SetReleaseFlagDecision($input: SetReleaseFlagDecisionInput!) {\n    setReleaseFlagDecision(input: $input) {\n      id\n      releaseId\n      trackedFlagId\n      decision\n      decidedAt\n      decidedById\n    }\n  }\n": typeof types.SetReleaseFlagDecisionDocument,
    "\n  query GetReleasesPage($projectId: ID!, $limit: Float!, $offset: Float!, $search: String) {\n    getReleasesPage(projectId: $projectId, limit: $limit, offset: $offset, search: $search) {\n      totalCount\n      hasMore\n      items {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        projectId\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.GetReleasesPageDocument,
    "\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        summaryModel\n        summaryProfileId\n        aiDraftStatus\n        summaryStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        excludedFromSummary\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          pendingAddition\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n          flagChanges {\n            flagKey\n            action\n            kind\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetReleaseTreeDocument,
    "\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n": typeof types.GetCoverageDocument,
    "\n  query SearchGithubBranches($projectId: ID!, $search: String, $limit: Float!) {\n    searchGithubBranches(projectId: $projectId, search: $search, limit: $limit) {\n      hasMore\n      items {\n        name\n        protected\n      }\n    }\n  }\n": typeof types.SearchGithubBranchesDocument,
    "\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n": typeof types.CompareRefsDocument,
    "\n  query ReleaseFlags($releaseId: ID!) {\n    releaseFlags(releaseId: $releaseId) {\n      id\n      key\n      decision\n      decidedAt\n      feature {\n        id\n        name\n      }\n      changes {\n        kind\n        action\n        detectedFile\n        prNumber\n        prTitle\n        prUrl\n      }\n    }\n  }\n": typeof types.ReleaseFlagsDocument,
    "\n  query InProgressFlagReminders($projectId: ID!, $excludeReleaseId: ID) {\n    inProgressFlagReminders(projectId: $projectId, excludeReleaseId: $excludeReleaseId) {\n      trackedFlagId\n      key\n      releaseId\n      releaseVersion\n      decidedAt\n      featureId\n    }\n  }\n": typeof types.InProgressFlagRemindersDocument,
    "\n  mutation BlockBranch($input: BlockBranchInput!) {\n    blockBranch(input: $input) {\n      id\n      branchName\n      reason\n      createdAt\n      createdById\n      projectId\n    }\n  }\n": typeof types.BlockBranchDocument,
    "\n  mutation UnblockBranch($input: UnblockBranchInput!) {\n    unblockBranch(input: $input)\n  }\n": typeof types.UnblockBranchDocument,
    "\n  mutation DeleteGithubBranches($input: DeleteGithubBranchesInput!) {\n    deleteGithubBranches(input: $input) {\n      branchName\n      deleted\n      reason\n    }\n  }\n": typeof types.DeleteGithubBranchesDocument,
    "\n  query GetBranchCleanupPage($input: BranchCleanupPageInput!) {\n    branchCleanupPage(input: $input) {\n      totalCount\n      items {\n        name\n        isDefault\n        githubProtected\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n        openPullRequestNumber\n        openPullRequestUrl\n        blockReasons\n        deletable\n        overridable\n        signals {\n          mergedViaPr\n          noOpenPr\n          unreferencedByReleases\n        }\n      }\n    }\n  }\n": typeof types.GetBranchCleanupPageDocument,
    "\n  query GetBranchAuthors($projectId: ID!) {\n    branchAuthors(projectId: $projectId)\n  }\n": typeof types.GetBranchAuthorsDocument,
    "\n  query GetBranchCleanupPlan($projectId: ID!) {\n    branchCleanupPlan(projectId: $projectId) {\n      totalCount\n      deletable {\n        name\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n      }\n      kept {\n        name\n        blockReasons\n      }\n    }\n  }\n": typeof types.GetBranchCleanupPlanDocument,
    "\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n      flagsmithWebhookPath\n      flagsmithWebhookSecretSet\n    }\n  }\n": typeof types.GetConnectionSettingsDocument,
    "\n  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {\n    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {\n      id\n      name\n    }\n  }\n": typeof types.FlagsmithProjectsDocument,
    "\n  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {\n    updateConnectionSettings(input: $input) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n": typeof types.UpdateConnectionSettingsDocument,
    "\n  query ProjectTags($projectId: ID!) {\n    projectTags(projectId: $projectId) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": typeof types.ProjectTagsDocument,
    "\n  mutation CreateProjectTag($input: CreateProjectTagInput!) {\n    createProjectTag(input: $input) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": typeof types.CreateProjectTagDocument,
    "\n  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {\n    deleteProjectTag(input: $input)\n  }\n": typeof types.DeleteProjectTagDocument,
    "\n  query GithubInstallUrl($projectId: String, $organizationId: String) {\n    githubInstallUrl(projectId: $projectId, organizationId: $organizationId)\n  }\n": typeof types.GithubInstallUrlDocument,
    "\n  mutation CompleteGithubInstallation($input: CompleteGithubInstallationInput!) {\n    completeGithubInstallation(input: $input) {\n      organizationId\n      connected\n    }\n  }\n": typeof types.CompleteGithubInstallationDocument,
    "\n  query LinearConnection($projectId: ID!) {\n    linearConnection(projectId: $projectId) {\n      connected\n      linearUser\n    }\n  }\n": typeof types.LinearConnectionDocument,
    "\n  query LinearAuthorizeUrl($projectId: ID!) {\n    linearAuthorizeUrl(projectId: $projectId)\n  }\n": typeof types.LinearAuthorizeUrlDocument,
    "\n  mutation DisconnectLinear($projectId: ID!) {\n    disconnectLinear(projectId: $projectId)\n  }\n": typeof types.DisconnectLinearDocument,
    "\n  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {\n    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {\n      ok\n      projectName\n      environments\n      hasStaging\n      hasProduction\n      warnings\n      message\n    }\n  }\n": typeof types.VerifyFlagsmithConnectionDocument,
    "\n  query RepoFileSearch($input: RepoFileSearchInput!) {\n    repoFileSearch(input: $input)\n  }\n": typeof types.RepoFileSearchDocument,
    "\n  mutation SetFlagRegistry($input: SetFlagRegistryInput!) {\n    setFlagRegistry(input: $input) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n": typeof types.SetFlagRegistryDocument,
    "\n  query FlagRegistry($projectId: ID!) {\n    flagRegistry(projectId: $projectId) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n": typeof types.FlagRegistryDocument,
    "\n  mutation RotateFlagsmithWebhookSecret($projectId: ID!) {\n    rotateFlagsmithWebhookSecret(projectId: $projectId) {\n      secret\n      connectionSettings {\n        flagsmithWebhookPath\n        flagsmithWebhookSecretSet\n      }\n    }\n  }\n": typeof types.RotateFlagsmithWebhookSecretDocument,
    "\n  query NotificationPreferences($projectId: ID!) {\n    notificationPreferences(projectId: $projectId) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n": typeof types.NotificationPreferencesDocument,
    "\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n": typeof types.UpdateNotificationPreferenceDocument,
    "\n  mutation TriggerFlagDigest($projectId: ID!) {\n    triggerFlagDigest(projectId: $projectId)\n  }\n": typeof types.TriggerFlagDigestDocument,
    "\n  query GetProjectFlagReminder($id: ID!) {\n    getProject(id: $id) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n": typeof types.GetProjectFlagReminderDocument,
    "\n  mutation UpdateProjectFlagReminder($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n": typeof types.UpdateProjectFlagReminderDocument,
    "\n  query FlagsmithEnvironments($projectId: ID!) {\n    flagsmithEnvironments(projectId: $projectId)\n  }\n": typeof types.FlagsmithEnvironmentsDocument,
    "\n  query GetProjectConflictEnvironments($id: ID!) {\n    getProject(id: $id) {\n      id\n      conflictEnvironments\n    }\n  }\n": typeof types.GetProjectConflictEnvironmentsDocument,
    "\n  mutation UpdateProjectConflictEnvironments($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      conflictEnvironments\n    }\n  }\n": typeof types.UpdateProjectConflictEnvironmentsDocument,
    "\n  query SummaryProfiles($projectId: ID!) {\n    summaryProfiles(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": typeof types.SummaryProfilesDocument,
    "\n  query SummaryProfile($profileId: ID!) {\n    summaryProfile(profileId: $profileId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": typeof types.SummaryProfileDocument,
    "\n  mutation CreateSummaryProfile($input: CreateSummaryProfileInput!) {\n    createSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": typeof types.CreateSummaryProfileDocument,
    "\n  mutation UpdateSummaryProfile($input: UpdateSummaryProfileInput!) {\n    updateSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": typeof types.UpdateSummaryProfileDocument,
    "\n  mutation DeleteSummaryProfile($input: DeleteSummaryProfileInput!) {\n    deleteSummaryProfile(input: $input)\n  }\n": typeof types.DeleteSummaryProfileDocument,
    "\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      organizationId\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": typeof types.ListProjectsDocument,
    "\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": typeof types.GetProjectDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.LoginDocument,
    "\n  mutation RefreshToken($input: RefreshTokenInput!) {\n    refreshToken(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RefreshTokenDocument,
    "\n  query Me {\n    me {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n": types.MeDocument,
    "\n  mutation RequestLoginCode($input: RequestLoginCodeInput!) {\n    requestLoginCode(input: $input)\n  }\n": types.RequestLoginCodeDocument,
    "\n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.LoginWithCodeDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RegisterDocument,
    "\n  query ListMembers($organizationId: ID!) {\n    listMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.ListMembersDocument,
    "\n  query ListInvitations($organizationId: ID!) {\n    listInvitations(organizationId: $organizationId) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": types.ListInvitationsDocument,
    "\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": types.InviteMemberDocument,
    "\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateMemberRoleDocument,
    "\n  mutation RemoveMember($membershipId: ID!) {\n    removeMember(membershipId: $membershipId)\n  }\n": types.RemoveMemberDocument,
    "\n  mutation RevokeInvitation($invitationId: ID!) {\n    revokeInvitation(invitationId: $invitationId)\n  }\n": types.RevokeInvitationDocument,
    "\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.AcceptInvitationDocument,
    "\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateFeatureDocument,
    "\n  mutation SetFeatureState($input: SetFeatureStateInput!) {\n    setFeatureState(input: $input) {\n      id\n      currentState\n      updatedAt\n    }\n  }\n": types.SetFeatureStateDocument,
    "\n  mutation SetFeatureTags($input: SetFeatureTagsInput!) {\n    setFeatureTags(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.SetFeatureTagsDocument,
    "\n  mutation DeleteFeature($id: ID!) {\n    deleteFeature(id: $id)\n  }\n": types.DeleteFeatureDocument,
    "\n  query ListFeaturesPage($input: ListFeaturesPageInput!) {\n    listFeaturesPage(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.ListFeaturesPageDocument,
    "\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n        flagState {\n          staging\n          production\n        }\n      }\n    }\n  }\n": types.GetFeatureDocument,
    "\n  mutation SyncFlagsmithFlags($projectId: ID!) {\n    syncFlagsmithFlags(projectId: $projectId)\n  }\n": types.SyncFlagsmithFlagsDocument,
    "\n  mutation RunFlagCoverage($projectId: ID!) {\n    runFlagCoverage(projectId: $projectId) {\n      flagsTracked\n      branchesScanned\n      prChangesDetected\n    }\n  }\n": types.RunFlagCoverageDocument,
    "\n  mutation RunFlagCoverageForFlag($projectId: ID!, $key: String!) {\n    runFlagCoverageForFlag(projectId: $projectId, key: $key) {\n      id\n      key\n      presentInCode\n      delivery {\n        inDefaultBranch\n        shippedReleaseVersions\n      }\n      feature {\n        id\n        name\n      }\n      branchPresences {\n        branch\n        present\n        firstSeenAt\n        lastConfirmedAt\n      }\n      releases {\n        releaseId\n        version\n        status\n        date\n        decision\n      }\n      pullRequestChanges {\n        prNumber\n        prTitle\n        prAuthor\n        prMergedAt\n        kind\n        action\n        detectedFile\n      }\n    }\n  }\n": types.RunFlagCoverageForFlagDocument,
    "\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      lastSyncedAt\n      items {\n        key\n        createdAt\n        deploymentStatus\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n": types.GetFlagsDocument,
    "\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled value }\n        divergences { name enabled value }\n      }\n    }\n  }\n": types.CompareFlagsDocument,
    "\n  query TrackedFlags($projectId: ID!) {\n    trackedFlags(projectId: $projectId) {\n      id\n      key\n      presentInCode\n      addedInPullRequestNumber\n      branchesPresentCount\n      branchPresences {\n        branch\n        present\n      }\n      feature {\n        id\n        name\n      }\n    }\n  }\n": types.TrackedFlagsDocument,
    "\n  query GetFlagDetail($projectId: ID!, $key: String!) {\n    flagDetail(projectId: $projectId, key: $key) {\n      key\n      deploymentStatus\n      hasConflict\n      flagsmith {\n        exists\n        lastSyncedAt\n        environments {\n          name\n          enabled\n          value\n          updatedAt\n        }\n      }\n      tracked {\n        id\n        key\n        presentInCode\n        delivery {\n          inDefaultBranch\n          shippedReleaseVersions\n        }\n        feature {\n          id\n          name\n        }\n        releases {\n          releaseId\n          version\n          status\n          date\n          decision\n        }\n      }\n    }\n  }\n": types.GetFlagDetailDocument,
    "\n  query GetFlagHistory($input: GetFlagHistoryInput!) {\n    flagHistory(input: $input) {\n      totalCount\n      items {\n        id\n        type\n        environmentName\n        previousValue\n        newValue\n        releaseId\n        releaseName\n        actorName\n        source\n        occurredAt\n        branchName\n        prNumber\n        detectedFile\n      }\n    }\n  }\n": types.GetFlagHistoryDocument,
    "\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n": types.MarkNotificationReadDocument,
    "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n": types.MarkAllNotificationsReadDocument,
    "\n  mutation ClearAllNotifications {\n    clearAllNotifications\n  }\n": types.ClearAllNotificationsDocument,
    "\n  query Notifications($input: NotificationsPageInput!) {\n    notifications(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        projectName\n        type\n        title\n        body\n        url\n        flagKey\n        readAt\n        createdAt\n      }\n    }\n  }\n": types.NotificationsDocument,
    "\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n": types.UnreadNotificationsCountDocument,
    "\n  subscription NotificationReceived($projectId: ID) {\n    notificationReceived(projectId: $projectId) {\n      id\n      projectId\n      projectName\n      type\n      title\n      body\n      url\n      flagKey\n      readAt\n      createdAt\n    }\n  }\n": types.NotificationReceivedDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n": types.CreateProjectDocument,
    "\n  query MyOrganizations {\n    myOrganizations {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": types.MyOrganizationsDocument,
    "\n  query GetOrganization($organizationId: ID!) {\n    getOrganization(organizationId: $organizationId) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": types.GetOrganizationDocument,
    "\n  query ListOrgMembers($organizationId: ID!) {\n    listOrgMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.ListOrgMembersDocument,
    "\n  query GithubInstallationRepositories($organizationId: ID!) {\n    githubInstallationRepositories(organizationId: $organizationId) {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n": types.GithubInstallationRepositoriesDocument,
    "\n  mutation CreateOrganization($input: CreateOrganizationInput!) {\n    createOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": types.CreateOrganizationDocument,
    "\n  mutation UpdateOrganization($input: UpdateOrganizationInput!) {\n    updateOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n": types.UpdateOrganizationDocument,
    "\n  mutation DeleteOrganization($organizationId: ID!) {\n    deleteOrganization(organizationId: $organizationId)\n  }\n": types.DeleteOrganizationDocument,
    "\n  mutation CreateRelease($input: CreateReleaseInput!) {\n    createRelease(input: $input) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      projectId\n      createdAt\n    }\n  }\n": types.CreateReleaseDocument,
    "\n  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {\n    createGithubBranch(input: $input) {\n      name\n      commitSha\n      protected\n    }\n  }\n": types.CreateGithubBranchDocument,
    "\n  mutation UpdateRelease($input: UpdateReleaseInput!) {\n    updateRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      aiDraftStatus\n      projectId\n    }\n  }\n": types.UpdateReleaseDocument,
    "\n  mutation ConfirmRelease($input: ConfirmReleaseInput!) {\n    confirmRelease(input: $input) {\n      id\n      name\n      status\n      prUrl\n      projectId\n    }\n  }\n": types.ConfirmReleaseDocument,
    "\n  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {\n    acceptSuggestedFeature(input: $input) {\n      id\n      name\n      description\n      kind\n      suggested\n      tags\n      projectId\n    }\n  }\n": types.AcceptSuggestedFeatureDocument,
    "\n  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {\n    rejectSuggestedFeature(input: $input)\n  }\n": types.RejectSuggestedFeatureDocument,
    "\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n      summaryModel\n      summaryProfileId\n    }\n  }\n": types.SaveReleaseSummaryDocument,
    "\n  mutation StartSummaryGeneration($input: StartSummaryGenerationInput!) {\n    startSummaryGeneration(input: $input) {\n      id\n      summaryStatus\n      summaryModel\n      summaryProfileId\n    }\n  }\n": types.StartSummaryGenerationDocument,
    "\n  mutation GeneratePrSummary($prId: ID!) {\n    generatePrSummary(prId: $prId) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": types.GeneratePrSummaryDocument,
    "\n  mutation SavePrSummary($input: SavePrSummaryInput!) {\n    savePrSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": types.SavePrSummaryDocument,
    "\n  mutation DeleteRelease($releaseId: ID!) {\n    deleteRelease(releaseId: $releaseId) {\n      id\n    }\n  }\n": types.DeleteReleaseDocument,
    "\n  mutation RegenerateDraft($releaseId: ID!, $resume: Boolean!) {\n    regenerateDraft(releaseId: $releaseId, resume: $resume) {\n      id\n      aiDraftStatus\n    }\n  }\n": types.RegenerateDraftDocument,
    "\n  mutation SetReleaseStatus($input: SetReleaseStatusInput!) {\n    setReleaseStatus(input: $input) {\n      id\n      status\n    }\n  }\n": types.SetReleaseStatusDocument,
    "\n  mutation ScanReleasePullRequests($releaseId: ID!) {\n    scanReleasePullRequests(releaseId: $releaseId) {\n      prsScanned\n      flagsFound\n      changesRecorded\n    }\n  }\n": types.ScanReleasePullRequestsDocument,
    "\n  mutation ResyncReleasePullRequests($releaseId: ID!) {\n    resyncReleasePullRequests(releaseId: $releaseId) {\n      newPrsAdded\n    }\n  }\n": types.ResyncReleasePullRequestsDocument,
    "\n  mutation ConfirmReleaseAdditions($releaseId: ID!) {\n    confirmReleaseAdditions(releaseId: $releaseId) {\n      id\n      status\n    }\n  }\n": types.ConfirmReleaseAdditionsDocument,
    "\n  mutation SetReleaseFlagDecision($input: SetReleaseFlagDecisionInput!) {\n    setReleaseFlagDecision(input: $input) {\n      id\n      releaseId\n      trackedFlagId\n      decision\n      decidedAt\n      decidedById\n    }\n  }\n": types.SetReleaseFlagDecisionDocument,
    "\n  query GetReleasesPage($projectId: ID!, $limit: Float!, $offset: Float!, $search: String) {\n    getReleasesPage(projectId: $projectId, limit: $limit, offset: $offset, search: $search) {\n      totalCount\n      hasMore\n      items {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        projectId\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.GetReleasesPageDocument,
    "\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        summaryModel\n        summaryProfileId\n        aiDraftStatus\n        summaryStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        excludedFromSummary\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          pendingAddition\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n          flagChanges {\n            flagKey\n            action\n            kind\n          }\n        }\n      }\n    }\n  }\n": types.GetReleaseTreeDocument,
    "\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n": types.GetCoverageDocument,
    "\n  query SearchGithubBranches($projectId: ID!, $search: String, $limit: Float!) {\n    searchGithubBranches(projectId: $projectId, search: $search, limit: $limit) {\n      hasMore\n      items {\n        name\n        protected\n      }\n    }\n  }\n": types.SearchGithubBranchesDocument,
    "\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n": types.CompareRefsDocument,
    "\n  query ReleaseFlags($releaseId: ID!) {\n    releaseFlags(releaseId: $releaseId) {\n      id\n      key\n      decision\n      decidedAt\n      feature {\n        id\n        name\n      }\n      changes {\n        kind\n        action\n        detectedFile\n        prNumber\n        prTitle\n        prUrl\n      }\n    }\n  }\n": types.ReleaseFlagsDocument,
    "\n  query InProgressFlagReminders($projectId: ID!, $excludeReleaseId: ID) {\n    inProgressFlagReminders(projectId: $projectId, excludeReleaseId: $excludeReleaseId) {\n      trackedFlagId\n      key\n      releaseId\n      releaseVersion\n      decidedAt\n      featureId\n    }\n  }\n": types.InProgressFlagRemindersDocument,
    "\n  mutation BlockBranch($input: BlockBranchInput!) {\n    blockBranch(input: $input) {\n      id\n      branchName\n      reason\n      createdAt\n      createdById\n      projectId\n    }\n  }\n": types.BlockBranchDocument,
    "\n  mutation UnblockBranch($input: UnblockBranchInput!) {\n    unblockBranch(input: $input)\n  }\n": types.UnblockBranchDocument,
    "\n  mutation DeleteGithubBranches($input: DeleteGithubBranchesInput!) {\n    deleteGithubBranches(input: $input) {\n      branchName\n      deleted\n      reason\n    }\n  }\n": types.DeleteGithubBranchesDocument,
    "\n  query GetBranchCleanupPage($input: BranchCleanupPageInput!) {\n    branchCleanupPage(input: $input) {\n      totalCount\n      items {\n        name\n        isDefault\n        githubProtected\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n        openPullRequestNumber\n        openPullRequestUrl\n        blockReasons\n        deletable\n        overridable\n        signals {\n          mergedViaPr\n          noOpenPr\n          unreferencedByReleases\n        }\n      }\n    }\n  }\n": types.GetBranchCleanupPageDocument,
    "\n  query GetBranchAuthors($projectId: ID!) {\n    branchAuthors(projectId: $projectId)\n  }\n": types.GetBranchAuthorsDocument,
    "\n  query GetBranchCleanupPlan($projectId: ID!) {\n    branchCleanupPlan(projectId: $projectId) {\n      totalCount\n      deletable {\n        name\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n      }\n      kept {\n        name\n        blockReasons\n      }\n    }\n  }\n": types.GetBranchCleanupPlanDocument,
    "\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n      flagsmithWebhookPath\n      flagsmithWebhookSecretSet\n    }\n  }\n": types.GetConnectionSettingsDocument,
    "\n  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {\n    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {\n      id\n      name\n    }\n  }\n": types.FlagsmithProjectsDocument,
    "\n  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {\n    updateConnectionSettings(input: $input) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n": types.UpdateConnectionSettingsDocument,
    "\n  query ProjectTags($projectId: ID!) {\n    projectTags(projectId: $projectId) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": types.ProjectTagsDocument,
    "\n  mutation CreateProjectTag($input: CreateProjectTagInput!) {\n    createProjectTag(input: $input) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": types.CreateProjectTagDocument,
    "\n  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {\n    deleteProjectTag(input: $input)\n  }\n": types.DeleteProjectTagDocument,
    "\n  query GithubInstallUrl($projectId: String, $organizationId: String) {\n    githubInstallUrl(projectId: $projectId, organizationId: $organizationId)\n  }\n": types.GithubInstallUrlDocument,
    "\n  mutation CompleteGithubInstallation($input: CompleteGithubInstallationInput!) {\n    completeGithubInstallation(input: $input) {\n      organizationId\n      connected\n    }\n  }\n": types.CompleteGithubInstallationDocument,
    "\n  query LinearConnection($projectId: ID!) {\n    linearConnection(projectId: $projectId) {\n      connected\n      linearUser\n    }\n  }\n": types.LinearConnectionDocument,
    "\n  query LinearAuthorizeUrl($projectId: ID!) {\n    linearAuthorizeUrl(projectId: $projectId)\n  }\n": types.LinearAuthorizeUrlDocument,
    "\n  mutation DisconnectLinear($projectId: ID!) {\n    disconnectLinear(projectId: $projectId)\n  }\n": types.DisconnectLinearDocument,
    "\n  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {\n    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {\n      ok\n      projectName\n      environments\n      hasStaging\n      hasProduction\n      warnings\n      message\n    }\n  }\n": types.VerifyFlagsmithConnectionDocument,
    "\n  query RepoFileSearch($input: RepoFileSearchInput!) {\n    repoFileSearch(input: $input)\n  }\n": types.RepoFileSearchDocument,
    "\n  mutation SetFlagRegistry($input: SetFlagRegistryInput!) {\n    setFlagRegistry(input: $input) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n": types.SetFlagRegistryDocument,
    "\n  query FlagRegistry($projectId: ID!) {\n    flagRegistry(projectId: $projectId) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n": types.FlagRegistryDocument,
    "\n  mutation RotateFlagsmithWebhookSecret($projectId: ID!) {\n    rotateFlagsmithWebhookSecret(projectId: $projectId) {\n      secret\n      connectionSettings {\n        flagsmithWebhookPath\n        flagsmithWebhookSecretSet\n      }\n    }\n  }\n": types.RotateFlagsmithWebhookSecretDocument,
    "\n  query NotificationPreferences($projectId: ID!) {\n    notificationPreferences(projectId: $projectId) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n": types.NotificationPreferencesDocument,
    "\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n": types.UpdateNotificationPreferenceDocument,
    "\n  mutation TriggerFlagDigest($projectId: ID!) {\n    triggerFlagDigest(projectId: $projectId)\n  }\n": types.TriggerFlagDigestDocument,
    "\n  query GetProjectFlagReminder($id: ID!) {\n    getProject(id: $id) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n": types.GetProjectFlagReminderDocument,
    "\n  mutation UpdateProjectFlagReminder($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n": types.UpdateProjectFlagReminderDocument,
    "\n  query FlagsmithEnvironments($projectId: ID!) {\n    flagsmithEnvironments(projectId: $projectId)\n  }\n": types.FlagsmithEnvironmentsDocument,
    "\n  query GetProjectConflictEnvironments($id: ID!) {\n    getProject(id: $id) {\n      id\n      conflictEnvironments\n    }\n  }\n": types.GetProjectConflictEnvironmentsDocument,
    "\n  mutation UpdateProjectConflictEnvironments($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      conflictEnvironments\n    }\n  }\n": types.UpdateProjectConflictEnvironmentsDocument,
    "\n  query SummaryProfiles($projectId: ID!) {\n    summaryProfiles(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": types.SummaryProfilesDocument,
    "\n  query SummaryProfile($profileId: ID!) {\n    summaryProfile(profileId: $profileId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": types.SummaryProfileDocument,
    "\n  mutation CreateSummaryProfile($input: CreateSummaryProfileInput!) {\n    createSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": types.CreateSummaryProfileDocument,
    "\n  mutation UpdateSummaryProfile($input: UpdateSummaryProfileInput!) {\n    updateSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n": types.UpdateSummaryProfileDocument,
    "\n  mutation DeleteSummaryProfile($input: DeleteSummaryProfileInput!) {\n    deleteSummaryProfile(input: $input)\n  }\n": types.DeleteSummaryProfileDocument,
    "\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      organizationId\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": types.ListProjectsDocument,
    "\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": types.GetProjectDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RefreshToken($input: RefreshTokenInput!) {\n    refreshToken(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation RefreshToken($input: RefreshTokenInput!) {\n    refreshToken(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestLoginCode($input: RequestLoginCodeInput!) {\n    requestLoginCode(input: $input)\n  }\n"): (typeof documents)["\n  mutation RequestLoginCode($input: RequestLoginCodeInput!) {\n    requestLoginCode(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListMembers($organizationId: ID!) {\n    listMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query ListMembers($organizationId: ID!) {\n    listMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListInvitations($organizationId: ID!) {\n    listInvitations(organizationId: $organizationId) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query ListInvitations($organizationId: ID!) {\n    listInvitations(organizationId: $organizationId) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      organizationId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveMember($membershipId: ID!) {\n    removeMember(membershipId: $membershipId)\n  }\n"): (typeof documents)["\n  mutation RemoveMember($membershipId: ID!) {\n    removeMember(membershipId: $membershipId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeInvitation($invitationId: ID!) {\n    revokeInvitation(invitationId: $invitationId)\n  }\n"): (typeof documents)["\n  mutation RevokeInvitation($invitationId: ID!) {\n    revokeInvitation(invitationId: $invitationId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetFeatureState($input: SetFeatureStateInput!) {\n    setFeatureState(input: $input) {\n      id\n      currentState\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation SetFeatureState($input: SetFeatureStateInput!) {\n    setFeatureState(input: $input) {\n      id\n      currentState\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetFeatureTags($input: SetFeatureTagsInput!) {\n    setFeatureTags(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation SetFeatureTags($input: SetFeatureTagsInput!) {\n    setFeatureTags(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteFeature($id: ID!) {\n    deleteFeature(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteFeature($id: ID!) {\n    deleteFeature(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListFeaturesPage($input: ListFeaturesPageInput!) {\n    listFeaturesPage(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query ListFeaturesPage($input: ListFeaturesPageInput!) {\n    listFeaturesPage(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n        flagState {\n          staging\n          production\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n        flagState {\n          staging\n          production\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SyncFlagsmithFlags($projectId: ID!) {\n    syncFlagsmithFlags(projectId: $projectId)\n  }\n"): (typeof documents)["\n  mutation SyncFlagsmithFlags($projectId: ID!) {\n    syncFlagsmithFlags(projectId: $projectId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RunFlagCoverage($projectId: ID!) {\n    runFlagCoverage(projectId: $projectId) {\n      flagsTracked\n      branchesScanned\n      prChangesDetected\n    }\n  }\n"): (typeof documents)["\n  mutation RunFlagCoverage($projectId: ID!) {\n    runFlagCoverage(projectId: $projectId) {\n      flagsTracked\n      branchesScanned\n      prChangesDetected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RunFlagCoverageForFlag($projectId: ID!, $key: String!) {\n    runFlagCoverageForFlag(projectId: $projectId, key: $key) {\n      id\n      key\n      presentInCode\n      delivery {\n        inDefaultBranch\n        shippedReleaseVersions\n      }\n      feature {\n        id\n        name\n      }\n      branchPresences {\n        branch\n        present\n        firstSeenAt\n        lastConfirmedAt\n      }\n      releases {\n        releaseId\n        version\n        status\n        date\n        decision\n      }\n      pullRequestChanges {\n        prNumber\n        prTitle\n        prAuthor\n        prMergedAt\n        kind\n        action\n        detectedFile\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RunFlagCoverageForFlag($projectId: ID!, $key: String!) {\n    runFlagCoverageForFlag(projectId: $projectId, key: $key) {\n      id\n      key\n      presentInCode\n      delivery {\n        inDefaultBranch\n        shippedReleaseVersions\n      }\n      feature {\n        id\n        name\n      }\n      branchPresences {\n        branch\n        present\n        firstSeenAt\n        lastConfirmedAt\n      }\n      releases {\n        releaseId\n        version\n        status\n        date\n        decision\n      }\n      pullRequestChanges {\n        prNumber\n        prTitle\n        prAuthor\n        prMergedAt\n        kind\n        action\n        detectedFile\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      lastSyncedAt\n      items {\n        key\n        createdAt\n        deploymentStatus\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      lastSyncedAt\n      items {\n        key\n        createdAt\n        deploymentStatus\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled value }\n        divergences { name enabled value }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled value }\n        divergences { name enabled value }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TrackedFlags($projectId: ID!) {\n    trackedFlags(projectId: $projectId) {\n      id\n      key\n      presentInCode\n      addedInPullRequestNumber\n      branchesPresentCount\n      branchPresences {\n        branch\n        present\n      }\n      feature {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query TrackedFlags($projectId: ID!) {\n    trackedFlags(projectId: $projectId) {\n      id\n      key\n      presentInCode\n      addedInPullRequestNumber\n      branchesPresentCount\n      branchPresences {\n        branch\n        present\n      }\n      feature {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFlagDetail($projectId: ID!, $key: String!) {\n    flagDetail(projectId: $projectId, key: $key) {\n      key\n      deploymentStatus\n      hasConflict\n      flagsmith {\n        exists\n        lastSyncedAt\n        environments {\n          name\n          enabled\n          value\n          updatedAt\n        }\n      }\n      tracked {\n        id\n        key\n        presentInCode\n        delivery {\n          inDefaultBranch\n          shippedReleaseVersions\n        }\n        feature {\n          id\n          name\n        }\n        releases {\n          releaseId\n          version\n          status\n          date\n          decision\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFlagDetail($projectId: ID!, $key: String!) {\n    flagDetail(projectId: $projectId, key: $key) {\n      key\n      deploymentStatus\n      hasConflict\n      flagsmith {\n        exists\n        lastSyncedAt\n        environments {\n          name\n          enabled\n          value\n          updatedAt\n        }\n      }\n      tracked {\n        id\n        key\n        presentInCode\n        delivery {\n          inDefaultBranch\n          shippedReleaseVersions\n        }\n        feature {\n          id\n          name\n        }\n        releases {\n          releaseId\n          version\n          status\n          date\n          decision\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFlagHistory($input: GetFlagHistoryInput!) {\n    flagHistory(input: $input) {\n      totalCount\n      items {\n        id\n        type\n        environmentName\n        previousValue\n        newValue\n        releaseId\n        releaseName\n        actorName\n        source\n        occurredAt\n        branchName\n        prNumber\n        detectedFile\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFlagHistory($input: GetFlagHistoryInput!) {\n    flagHistory(input: $input) {\n      totalCount\n      items {\n        id\n        type\n        environmentName\n        previousValue\n        newValue\n        releaseId\n        releaseName\n        actorName\n        source\n        occurredAt\n        branchName\n        prNumber\n        detectedFile\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n"): (typeof documents)["\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n"): (typeof documents)["\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ClearAllNotifications {\n    clearAllNotifications\n  }\n"): (typeof documents)["\n  mutation ClearAllNotifications {\n    clearAllNotifications\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Notifications($input: NotificationsPageInput!) {\n    notifications(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        projectName\n        type\n        title\n        body\n        url\n        flagKey\n        readAt\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query Notifications($input: NotificationsPageInput!) {\n    notifications(input: $input) {\n      totalCount\n      hasMore\n      items {\n        id\n        projectId\n        projectName\n        type\n        title\n        body\n        url\n        flagKey\n        readAt\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n"): (typeof documents)["\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription NotificationReceived($projectId: ID) {\n    notificationReceived(projectId: $projectId) {\n      id\n      projectId\n      projectName\n      type\n      title\n      body\n      url\n      flagKey\n      readAt\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  subscription NotificationReceived($projectId: ID) {\n    notificationReceived(projectId: $projectId) {\n      id\n      projectId\n      projectName\n      type\n      title\n      body\n      url\n      flagKey\n      readAt\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyOrganizations {\n    myOrganizations {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"): (typeof documents)["\n  query MyOrganizations {\n    myOrganizations {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganization($organizationId: ID!) {\n    getOrganization(organizationId: $organizationId) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"): (typeof documents)["\n  query GetOrganization($organizationId: ID!) {\n    getOrganization(organizationId: $organizationId) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListOrgMembers($organizationId: ID!) {\n    listOrgMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query ListOrgMembers($organizationId: ID!) {\n    listOrgMembers(organizationId: $organizationId) {\n      id\n      userId\n      organizationId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GithubInstallationRepositories($organizationId: ID!) {\n    githubInstallationRepositories(organizationId: $organizationId) {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n"): (typeof documents)["\n  query GithubInstallationRepositories($organizationId: ID!) {\n    githubInstallationRepositories(organizationId: $organizationId) {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOrganization($input: CreateOrganizationInput!) {\n    createOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOrganization($input: CreateOrganizationInput!) {\n    createOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOrganization($input: UpdateOrganizationInput!) {\n    updateOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOrganization($input: UpdateOrganizationInput!) {\n    updateOrganization(input: $input) {\n      id\n      name\n      role\n      slug\n      githubConnected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteOrganization($organizationId: ID!) {\n    deleteOrganization(organizationId: $organizationId)\n  }\n"): (typeof documents)["\n  mutation DeleteOrganization($organizationId: ID!) {\n    deleteOrganization(organizationId: $organizationId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateRelease($input: CreateReleaseInput!) {\n    createRelease(input: $input) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      projectId\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateRelease($input: CreateReleaseInput!) {\n    createRelease(input: $input) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      projectId\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {\n    createGithubBranch(input: $input) {\n      name\n      commitSha\n      protected\n    }\n  }\n"): (typeof documents)["\n  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {\n    createGithubBranch(input: $input) {\n      name\n      commitSha\n      protected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateRelease($input: UpdateReleaseInput!) {\n    updateRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      aiDraftStatus\n      projectId\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateRelease($input: UpdateReleaseInput!) {\n    updateRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      aiDraftStatus\n      projectId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConfirmRelease($input: ConfirmReleaseInput!) {\n    confirmRelease(input: $input) {\n      id\n      name\n      status\n      prUrl\n      projectId\n    }\n  }\n"): (typeof documents)["\n  mutation ConfirmRelease($input: ConfirmReleaseInput!) {\n    confirmRelease(input: $input) {\n      id\n      name\n      status\n      prUrl\n      projectId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {\n    acceptSuggestedFeature(input: $input) {\n      id\n      name\n      description\n      kind\n      suggested\n      tags\n      projectId\n    }\n  }\n"): (typeof documents)["\n  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {\n    acceptSuggestedFeature(input: $input) {\n      id\n      name\n      description\n      kind\n      suggested\n      tags\n      projectId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {\n    rejectSuggestedFeature(input: $input)\n  }\n"): (typeof documents)["\n  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {\n    rejectSuggestedFeature(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n      summaryModel\n      summaryProfileId\n    }\n  }\n"): (typeof documents)["\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n      summaryModel\n      summaryProfileId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartSummaryGeneration($input: StartSummaryGenerationInput!) {\n    startSummaryGeneration(input: $input) {\n      id\n      summaryStatus\n      summaryModel\n      summaryProfileId\n    }\n  }\n"): (typeof documents)["\n  mutation StartSummaryGeneration($input: StartSummaryGenerationInput!) {\n    startSummaryGeneration(input: $input) {\n      id\n      summaryStatus\n      summaryModel\n      summaryProfileId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GeneratePrSummary($prId: ID!) {\n    generatePrSummary(prId: $prId) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n"): (typeof documents)["\n  mutation GeneratePrSummary($prId: ID!) {\n    generatePrSummary(prId: $prId) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SavePrSummary($input: SavePrSummaryInput!) {\n    savePrSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n"): (typeof documents)["\n  mutation SavePrSummary($input: SavePrSummaryInput!) {\n    savePrSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteRelease($releaseId: ID!) {\n    deleteRelease(releaseId: $releaseId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteRelease($releaseId: ID!) {\n    deleteRelease(releaseId: $releaseId) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegenerateDraft($releaseId: ID!, $resume: Boolean!) {\n    regenerateDraft(releaseId: $releaseId, resume: $resume) {\n      id\n      aiDraftStatus\n    }\n  }\n"): (typeof documents)["\n  mutation RegenerateDraft($releaseId: ID!, $resume: Boolean!) {\n    regenerateDraft(releaseId: $releaseId, resume: $resume) {\n      id\n      aiDraftStatus\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetReleaseStatus($input: SetReleaseStatusInput!) {\n    setReleaseStatus(input: $input) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation SetReleaseStatus($input: SetReleaseStatusInput!) {\n    setReleaseStatus(input: $input) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ScanReleasePullRequests($releaseId: ID!) {\n    scanReleasePullRequests(releaseId: $releaseId) {\n      prsScanned\n      flagsFound\n      changesRecorded\n    }\n  }\n"): (typeof documents)["\n  mutation ScanReleasePullRequests($releaseId: ID!) {\n    scanReleasePullRequests(releaseId: $releaseId) {\n      prsScanned\n      flagsFound\n      changesRecorded\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResyncReleasePullRequests($releaseId: ID!) {\n    resyncReleasePullRequests(releaseId: $releaseId) {\n      newPrsAdded\n    }\n  }\n"): (typeof documents)["\n  mutation ResyncReleasePullRequests($releaseId: ID!) {\n    resyncReleasePullRequests(releaseId: $releaseId) {\n      newPrsAdded\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConfirmReleaseAdditions($releaseId: ID!) {\n    confirmReleaseAdditions(releaseId: $releaseId) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation ConfirmReleaseAdditions($releaseId: ID!) {\n    confirmReleaseAdditions(releaseId: $releaseId) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetReleaseFlagDecision($input: SetReleaseFlagDecisionInput!) {\n    setReleaseFlagDecision(input: $input) {\n      id\n      releaseId\n      trackedFlagId\n      decision\n      decidedAt\n      decidedById\n    }\n  }\n"): (typeof documents)["\n  mutation SetReleaseFlagDecision($input: SetReleaseFlagDecisionInput!) {\n    setReleaseFlagDecision(input: $input) {\n      id\n      releaseId\n      trackedFlagId\n      decision\n      decidedAt\n      decidedById\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetReleasesPage($projectId: ID!, $limit: Float!, $offset: Float!, $search: String) {\n    getReleasesPage(projectId: $projectId, limit: $limit, offset: $offset, search: $search) {\n      totalCount\n      hasMore\n      items {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        projectId\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetReleasesPage($projectId: ID!, $limit: Float!, $offset: Float!, $search: String) {\n    getReleasesPage(projectId: $projectId, limit: $limit, offset: $offset, search: $search) {\n      totalCount\n      hasMore\n      items {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        projectId\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        summaryModel\n        summaryProfileId\n        aiDraftStatus\n        summaryStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        excludedFromSummary\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          pendingAddition\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n          flagChanges {\n            flagKey\n            action\n            kind\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        summaryModel\n        summaryProfileId\n        aiDraftStatus\n        summaryStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        excludedFromSummary\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          pendingAddition\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n          flagChanges {\n            flagKey\n            action\n            kind\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n"): (typeof documents)["\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchGithubBranches($projectId: ID!, $search: String, $limit: Float!) {\n    searchGithubBranches(projectId: $projectId, search: $search, limit: $limit) {\n      hasMore\n      items {\n        name\n        protected\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchGithubBranches($projectId: ID!, $search: String, $limit: Float!) {\n    searchGithubBranches(projectId: $projectId, search: $search, limit: $limit) {\n      hasMore\n      items {\n        name\n        protected\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ReleaseFlags($releaseId: ID!) {\n    releaseFlags(releaseId: $releaseId) {\n      id\n      key\n      decision\n      decidedAt\n      feature {\n        id\n        name\n      }\n      changes {\n        kind\n        action\n        detectedFile\n        prNumber\n        prTitle\n        prUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  query ReleaseFlags($releaseId: ID!) {\n    releaseFlags(releaseId: $releaseId) {\n      id\n      key\n      decision\n      decidedAt\n      feature {\n        id\n        name\n      }\n      changes {\n        kind\n        action\n        detectedFile\n        prNumber\n        prTitle\n        prUrl\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query InProgressFlagReminders($projectId: ID!, $excludeReleaseId: ID) {\n    inProgressFlagReminders(projectId: $projectId, excludeReleaseId: $excludeReleaseId) {\n      trackedFlagId\n      key\n      releaseId\n      releaseVersion\n      decidedAt\n      featureId\n    }\n  }\n"): (typeof documents)["\n  query InProgressFlagReminders($projectId: ID!, $excludeReleaseId: ID) {\n    inProgressFlagReminders(projectId: $projectId, excludeReleaseId: $excludeReleaseId) {\n      trackedFlagId\n      key\n      releaseId\n      releaseVersion\n      decidedAt\n      featureId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation BlockBranch($input: BlockBranchInput!) {\n    blockBranch(input: $input) {\n      id\n      branchName\n      reason\n      createdAt\n      createdById\n      projectId\n    }\n  }\n"): (typeof documents)["\n  mutation BlockBranch($input: BlockBranchInput!) {\n    blockBranch(input: $input) {\n      id\n      branchName\n      reason\n      createdAt\n      createdById\n      projectId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnblockBranch($input: UnblockBranchInput!) {\n    unblockBranch(input: $input)\n  }\n"): (typeof documents)["\n  mutation UnblockBranch($input: UnblockBranchInput!) {\n    unblockBranch(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteGithubBranches($input: DeleteGithubBranchesInput!) {\n    deleteGithubBranches(input: $input) {\n      branchName\n      deleted\n      reason\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteGithubBranches($input: DeleteGithubBranchesInput!) {\n    deleteGithubBranches(input: $input) {\n      branchName\n      deleted\n      reason\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBranchCleanupPage($input: BranchCleanupPageInput!) {\n    branchCleanupPage(input: $input) {\n      totalCount\n      items {\n        name\n        isDefault\n        githubProtected\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n        openPullRequestNumber\n        openPullRequestUrl\n        blockReasons\n        deletable\n        overridable\n        signals {\n          mergedViaPr\n          noOpenPr\n          unreferencedByReleases\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetBranchCleanupPage($input: BranchCleanupPageInput!) {\n    branchCleanupPage(input: $input) {\n      totalCount\n      items {\n        name\n        isDefault\n        githubProtected\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n        openPullRequestNumber\n        openPullRequestUrl\n        blockReasons\n        deletable\n        overridable\n        signals {\n          mergedViaPr\n          noOpenPr\n          unreferencedByReleases\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBranchAuthors($projectId: ID!) {\n    branchAuthors(projectId: $projectId)\n  }\n"): (typeof documents)["\n  query GetBranchAuthors($projectId: ID!) {\n    branchAuthors(projectId: $projectId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBranchCleanupPlan($projectId: ID!) {\n    branchCleanupPlan(projectId: $projectId) {\n      totalCount\n      deletable {\n        name\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n      }\n      kept {\n        name\n        blockReasons\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetBranchCleanupPlan($projectId: ID!) {\n    branchCleanupPlan(projectId: $projectId) {\n      totalCount\n      deletable {\n        name\n        lastCommitAt\n        lastCommitAuthorLogin\n        lastCommitAuthorName\n        lastCommitAuthorAvatarUrl\n      }\n      kept {\n        name\n        blockReasons\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n      flagsmithWebhookPath\n      flagsmithWebhookSecretSet\n    }\n  }\n"): (typeof documents)["\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n      flagsmithWebhookPath\n      flagsmithWebhookSecretSet\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {\n    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {\n    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {\n    updateConnectionSettings(input: $input) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {\n    updateConnectionSettings(input: $input) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectTags($projectId: ID!) {\n    projectTags(projectId: $projectId) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query ProjectTags($projectId: ID!) {\n    projectTags(projectId: $projectId) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateProjectTag($input: CreateProjectTagInput!) {\n    createProjectTag(input: $input) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProjectTag($input: CreateProjectTagInput!) {\n    createProjectTag(input: $input) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {\n    deleteProjectTag(input: $input)\n  }\n"): (typeof documents)["\n  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {\n    deleteProjectTag(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GithubInstallUrl($projectId: String, $organizationId: String) {\n    githubInstallUrl(projectId: $projectId, organizationId: $organizationId)\n  }\n"): (typeof documents)["\n  query GithubInstallUrl($projectId: String, $organizationId: String) {\n    githubInstallUrl(projectId: $projectId, organizationId: $organizationId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CompleteGithubInstallation($input: CompleteGithubInstallationInput!) {\n    completeGithubInstallation(input: $input) {\n      organizationId\n      connected\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteGithubInstallation($input: CompleteGithubInstallationInput!) {\n    completeGithubInstallation(input: $input) {\n      organizationId\n      connected\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LinearConnection($projectId: ID!) {\n    linearConnection(projectId: $projectId) {\n      connected\n      linearUser\n    }\n  }\n"): (typeof documents)["\n  query LinearConnection($projectId: ID!) {\n    linearConnection(projectId: $projectId) {\n      connected\n      linearUser\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LinearAuthorizeUrl($projectId: ID!) {\n    linearAuthorizeUrl(projectId: $projectId)\n  }\n"): (typeof documents)["\n  query LinearAuthorizeUrl($projectId: ID!) {\n    linearAuthorizeUrl(projectId: $projectId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DisconnectLinear($projectId: ID!) {\n    disconnectLinear(projectId: $projectId)\n  }\n"): (typeof documents)["\n  mutation DisconnectLinear($projectId: ID!) {\n    disconnectLinear(projectId: $projectId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {\n    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {\n      ok\n      projectName\n      environments\n      hasStaging\n      hasProduction\n      warnings\n      message\n    }\n  }\n"): (typeof documents)["\n  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {\n    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {\n      ok\n      projectName\n      environments\n      hasStaging\n      hasProduction\n      warnings\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RepoFileSearch($input: RepoFileSearchInput!) {\n    repoFileSearch(input: $input)\n  }\n"): (typeof documents)["\n  query RepoFileSearch($input: RepoFileSearchInput!) {\n    repoFileSearch(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetFlagRegistry($input: SetFlagRegistryInput!) {\n    setFlagRegistry(input: $input) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n"): (typeof documents)["\n  mutation SetFlagRegistry($input: SetFlagRegistryInput!) {\n    setFlagRegistry(input: $input) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FlagRegistry($projectId: ID!) {\n    flagRegistry(projectId: $projectId) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n"): (typeof documents)["\n  query FlagRegistry($projectId: ID!) {\n    flagRegistry(projectId: $projectId) {\n      projectId\n      flagRegistryPath\n      flagRegistryBranch\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RotateFlagsmithWebhookSecret($projectId: ID!) {\n    rotateFlagsmithWebhookSecret(projectId: $projectId) {\n      secret\n      connectionSettings {\n        flagsmithWebhookPath\n        flagsmithWebhookSecretSet\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RotateFlagsmithWebhookSecret($projectId: ID!) {\n    rotateFlagsmithWebhookSecret(projectId: $projectId) {\n      secret\n      connectionSettings {\n        flagsmithWebhookPath\n        flagsmithWebhookSecretSet\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query NotificationPreferences($projectId: ID!) {\n    notificationPreferences(projectId: $projectId) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n"): (typeof documents)["\n  query NotificationPreferences($projectId: ID!) {\n    notificationPreferences(projectId: $projectId) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      notificationType\n      channel\n      enabled\n      digestFrequency\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation TriggerFlagDigest($projectId: ID!) {\n    triggerFlagDigest(projectId: $projectId)\n  }\n"): (typeof documents)["\n  mutation TriggerFlagDigest($projectId: ID!) {\n    triggerFlagDigest(projectId: $projectId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetProjectFlagReminder($id: ID!) {\n    getProject(id: $id) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n"): (typeof documents)["\n  query GetProjectFlagReminder($id: ID!) {\n    getProject(id: $id) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProjectFlagReminder($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProjectFlagReminder($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      flagReminderIntervalDays\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FlagsmithEnvironments($projectId: ID!) {\n    flagsmithEnvironments(projectId: $projectId)\n  }\n"): (typeof documents)["\n  query FlagsmithEnvironments($projectId: ID!) {\n    flagsmithEnvironments(projectId: $projectId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetProjectConflictEnvironments($id: ID!) {\n    getProject(id: $id) {\n      id\n      conflictEnvironments\n    }\n  }\n"): (typeof documents)["\n  query GetProjectConflictEnvironments($id: ID!) {\n    getProject(id: $id) {\n      id\n      conflictEnvironments\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProjectConflictEnvironments($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      conflictEnvironments\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProjectConflictEnvironments($input: UpdateProjectInput!) {\n    updateProject(input: $input) {\n      id\n      conflictEnvironments\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SummaryProfiles($projectId: ID!) {\n    summaryProfiles(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"): (typeof documents)["\n  query SummaryProfiles($projectId: ID!) {\n    summaryProfiles(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SummaryProfile($profileId: ID!) {\n    summaryProfile(profileId: $profileId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"): (typeof documents)["\n  query SummaryProfile($profileId: ID!) {\n    summaryProfile(profileId: $profileId) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSummaryProfile($input: CreateSummaryProfileInput!) {\n    createSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSummaryProfile($input: CreateSummaryProfileInput!) {\n    createSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSummaryProfile($input: UpdateSummaryProfileInput!) {\n    updateSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSummaryProfile($input: UpdateSummaryProfileInput!) {\n    updateSummaryProfile(input: $input) {\n      id\n      projectId\n      name\n      description\n      outputTemplate\n      createdAt\n      updatedAt\n      rules {\n        id\n        content\n      }\n      examples {\n        id\n        kind\n        content\n        explanation\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteSummaryProfile($input: DeleteSummaryProfileInput!) {\n    deleteSummaryProfile(input: $input)\n  }\n"): (typeof documents)["\n  mutation DeleteSummaryProfile($input: DeleteSummaryProfileInput!) {\n    deleteSummaryProfile(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      organizationId\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"): (typeof documents)["\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      organizationId\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;