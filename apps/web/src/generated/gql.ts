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
    "\n  query ListMembers($projectId: ID!) {\n    listMembers(projectId: $projectId) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ListMembersDocument,
    "\n  query ListInvitations($projectId: ID!) {\n    listInvitations(projectId: $projectId) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ListInvitationsDocument,
    "\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.InviteMemberDocument,
    "\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateMemberRoleDocument,
    "\n  mutation RemoveMember($membershipId: ID!) {\n    removeMember(membershipId: $membershipId)\n  }\n": typeof types.RemoveMemberDocument,
    "\n  mutation RevokeInvitation($invitationId: ID!) {\n    revokeInvitation(invitationId: $invitationId)\n  }\n": typeof types.RevokeInvitationDocument,
    "\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.AcceptInvitationDocument,
    "\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateFeatureDocument,
    "\n  mutation AssignPrToFeature($input: AssignPrToFeatureInput!) {\n    assignPrToFeature(input: $input)\n  }\n": typeof types.AssignPrToFeatureDocument,
    "\n  mutation SetFeatureState($input: SetFeatureStateInput!) {\n    setFeatureState(input: $input) {\n      id\n      currentState\n      updatedAt\n    }\n  }\n": typeof types.SetFeatureStateDocument,
    "\n  mutation SetFeatureTags($input: SetFeatureTagsInput!) {\n    setFeatureTags(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.SetFeatureTagsDocument,
    "\n  mutation DeleteFeature($id: ID!) {\n    deleteFeature(id: $id)\n  }\n": typeof types.DeleteFeatureDocument,
    "\n  query ListFeatures($projectId: ID!) {\n    listFeatures(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      kind\n      suggested\n      tags\n      currentState\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ListFeaturesDocument,
    "\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n      }\n    }\n  }\n": typeof types.GetFeatureDocument,
    "\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      items {\n        key\n        createdAt\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n": typeof types.GetFlagsDocument,
    "\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled }\n        divergences { name enabled }\n      }\n    }\n  }\n": typeof types.CompareFlagsDocument,
    "\n  query GithubRepositories {\n    githubRepositories {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n": typeof types.GithubRepositoriesDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n": typeof types.CreateProjectDocument,
    "\n  mutation CreateRelease($input: CreateReleaseInput!) {\n    createRelease(input: $input) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      projectId\n      createdAt\n    }\n  }\n": typeof types.CreateReleaseDocument,
    "\n  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {\n    createGithubBranch(input: $input) {\n      name\n      commitSha\n      protected\n    }\n  }\n": typeof types.CreateGithubBranchDocument,
    "\n  mutation ShipRelease($input: ShipReleaseInput!) {\n    shipRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      projectId\n    }\n  }\n": typeof types.ShipReleaseDocument,
    "\n  mutation UpdateRelease($input: UpdateReleaseInput!) {\n    updateRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      aiDraftStatus\n      projectId\n    }\n  }\n": typeof types.UpdateReleaseDocument,
    "\n  mutation ConfirmRelease($input: ConfirmReleaseInput!) {\n    confirmRelease(input: $input) {\n      id\n      name\n      status\n      prUrl\n      projectId\n    }\n  }\n": typeof types.ConfirmReleaseDocument,
    "\n  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {\n    acceptSuggestedFeature(input: $input) {\n      id\n      name\n      description\n      kind\n      suggested\n      tags\n      projectId\n    }\n  }\n": typeof types.AcceptSuggestedFeatureDocument,
    "\n  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {\n    rejectSuggestedFeature(input: $input)\n  }\n": typeof types.RejectSuggestedFeatureDocument,
    "\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": typeof types.SaveReleaseSummaryDocument,
    "\n  mutation GeneratePrSummary($prId: ID!) {\n    generatePrSummary(prId: $prId) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": typeof types.GeneratePrSummaryDocument,
    "\n  mutation SavePrSummary($input: SavePrSummaryInput!) {\n    savePrSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": typeof types.SavePrSummaryDocument,
    "\n  mutation DeleteRelease($releaseId: ID!) {\n    deleteRelease(releaseId: $releaseId) {\n      id\n    }\n  }\n": typeof types.DeleteReleaseDocument,
    "\n  mutation RegenerateDraft($releaseId: ID!, $resume: Boolean!) {\n    regenerateDraft(releaseId: $releaseId, resume: $resume) {\n      id\n      aiDraftStatus\n    }\n  }\n": typeof types.RegenerateDraftDocument,
    "\n  mutation SetReleaseStatus($input: SetReleaseStatusInput!) {\n    setReleaseStatus(input: $input) {\n      id\n      status\n    }\n  }\n": typeof types.SetReleaseStatusDocument,
    "\n  query GetReleases($projectId: ID!) {\n    getReleases(projectId: $projectId) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetReleasesDocument,
    "\n  query GetRelease($id: ID!) {\n    getRelease(id: $id) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetReleaseDocument,
    "\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        aiDraftStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetReleaseTreeDocument,
    "\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n": typeof types.GetCoverageDocument,
    "\n  query ExportSummary($input: ExportSummaryInput!) {\n    exportSummary(input: $input) {\n      url\n      filename\n    }\n  }\n": typeof types.ExportSummaryDocument,
    "\n  query SuggestFeatureForPr($prId: ID!) {\n    suggestFeatureForPr(prId: $prId) {\n      featureId\n      confidence\n      rationale\n    }\n  }\n": typeof types.SuggestFeatureForPrDocument,
    "\n  subscription GenerateSummary($input: GenerateSummaryInput!) {\n    generateSummary(input: $input) {\n      chunk\n      done\n    }\n  }\n": typeof types.GenerateSummaryDocument,
    "\n  query GithubBranches($projectId: ID!) {\n    githubBranches(projectId: $projectId) {\n      name\n      protected\n      commitSha\n    }\n  }\n": typeof types.GithubBranchesDocument,
    "\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n": typeof types.CompareRefsDocument,
    "\n  query DiffRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    diffRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      id\n      number\n      title\n      body\n      author\n      mergedAt\n      releaseId\n      featureId\n      tickets {\n        issueId\n        source\n        url\n        title\n        confidence\n      }\n      commits {\n        sha\n        message\n        author\n        date\n      }\n    }\n  }\n": typeof types.DiffRefsDocument,
    "\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n": typeof types.GetConnectionSettingsDocument,
    "\n  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {\n    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {\n      id\n      name\n    }\n  }\n": typeof types.FlagsmithProjectsDocument,
    "\n  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {\n    updateConnectionSettings(input: $input) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n": typeof types.UpdateConnectionSettingsDocument,
    "\n  query ProjectTags($projectId: ID!) {\n    projectTags(projectId: $projectId) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": typeof types.ProjectTagsDocument,
    "\n  mutation CreateProjectTag($input: CreateProjectTagInput!) {\n    createProjectTag(input: $input) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": typeof types.CreateProjectTagDocument,
    "\n  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {\n    deleteProjectTag(input: $input)\n  }\n": typeof types.DeleteProjectTagDocument,
    "\n  query GithubConnection {\n    githubConnection {\n      connected\n      githubLogin\n    }\n  }\n": typeof types.GithubConnectionDocument,
    "\n  query GithubAuthorizeUrl {\n    githubAuthorizeUrl\n  }\n": typeof types.GithubAuthorizeUrlDocument,
    "\n  mutation DisconnectGithub {\n    disconnectGithub\n  }\n": typeof types.DisconnectGithubDocument,
    "\n  mutation ReauthorizeGithub {\n    reauthorizeGithub\n  }\n": typeof types.ReauthorizeGithubDocument,
    "\n  query LinearConnection($projectId: ID!) {\n    linearConnection(projectId: $projectId) {\n      connected\n      linearUser\n    }\n  }\n": typeof types.LinearConnectionDocument,
    "\n  query LinearAuthorizeUrl($projectId: ID!) {\n    linearAuthorizeUrl(projectId: $projectId)\n  }\n": typeof types.LinearAuthorizeUrlDocument,
    "\n  mutation DisconnectLinear($projectId: ID!) {\n    disconnectLinear(projectId: $projectId)\n  }\n": typeof types.DisconnectLinearDocument,
    "\n  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {\n    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {\n      ok\n      projectName\n      environments\n      hasStaging\n      hasProduction\n      warnings\n      message\n    }\n  }\n": typeof types.VerifyFlagsmithConnectionDocument,
    "\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": typeof types.ListProjectsDocument,
    "\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": typeof types.GetProjectDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.LoginDocument,
    "\n  mutation RefreshToken($input: RefreshTokenInput!) {\n    refreshToken(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RefreshTokenDocument,
    "\n  query Me {\n    me {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n": types.MeDocument,
    "\n  mutation RequestLoginCode($input: RequestLoginCodeInput!) {\n    requestLoginCode(input: $input)\n  }\n": types.RequestLoginCodeDocument,
    "\n  mutation LoginWithCode($input: LoginWithCodeInput!) {\n    loginWithCode(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.LoginWithCodeDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RegisterDocument,
    "\n  query ListMembers($projectId: ID!) {\n    listMembers(projectId: $projectId) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.ListMembersDocument,
    "\n  query ListInvitations($projectId: ID!) {\n    listInvitations(projectId: $projectId) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": types.ListInvitationsDocument,
    "\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n": types.InviteMemberDocument,
    "\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateMemberRoleDocument,
    "\n  mutation RemoveMember($membershipId: ID!) {\n    removeMember(membershipId: $membershipId)\n  }\n": types.RemoveMemberDocument,
    "\n  mutation RevokeInvitation($invitationId: ID!) {\n    revokeInvitation(invitationId: $invitationId)\n  }\n": types.RevokeInvitationDocument,
    "\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n": types.AcceptInvitationDocument,
    "\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateFeatureDocument,
    "\n  mutation AssignPrToFeature($input: AssignPrToFeatureInput!) {\n    assignPrToFeature(input: $input)\n  }\n": types.AssignPrToFeatureDocument,
    "\n  mutation SetFeatureState($input: SetFeatureStateInput!) {\n    setFeatureState(input: $input) {\n      id\n      currentState\n      updatedAt\n    }\n  }\n": types.SetFeatureStateDocument,
    "\n  mutation SetFeatureTags($input: SetFeatureTagsInput!) {\n    setFeatureTags(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.SetFeatureTagsDocument,
    "\n  mutation DeleteFeature($id: ID!) {\n    deleteFeature(id: $id)\n  }\n": types.DeleteFeatureDocument,
    "\n  query ListFeatures($projectId: ID!) {\n    listFeatures(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      kind\n      suggested\n      tags\n      currentState\n      createdAt\n      updatedAt\n    }\n  }\n": types.ListFeaturesDocument,
    "\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n      }\n    }\n  }\n": types.GetFeatureDocument,
    "\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      items {\n        key\n        createdAt\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n": types.GetFlagsDocument,
    "\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled }\n        divergences { name enabled }\n      }\n    }\n  }\n": types.CompareFlagsDocument,
    "\n  query GithubRepositories {\n    githubRepositories {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n": types.GithubRepositoriesDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n": types.CreateProjectDocument,
    "\n  mutation CreateRelease($input: CreateReleaseInput!) {\n    createRelease(input: $input) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      projectId\n      createdAt\n    }\n  }\n": types.CreateReleaseDocument,
    "\n  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {\n    createGithubBranch(input: $input) {\n      name\n      commitSha\n      protected\n    }\n  }\n": types.CreateGithubBranchDocument,
    "\n  mutation ShipRelease($input: ShipReleaseInput!) {\n    shipRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      projectId\n    }\n  }\n": types.ShipReleaseDocument,
    "\n  mutation UpdateRelease($input: UpdateReleaseInput!) {\n    updateRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      aiDraftStatus\n      projectId\n    }\n  }\n": types.UpdateReleaseDocument,
    "\n  mutation ConfirmRelease($input: ConfirmReleaseInput!) {\n    confirmRelease(input: $input) {\n      id\n      name\n      status\n      prUrl\n      projectId\n    }\n  }\n": types.ConfirmReleaseDocument,
    "\n  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {\n    acceptSuggestedFeature(input: $input) {\n      id\n      name\n      description\n      kind\n      suggested\n      tags\n      projectId\n    }\n  }\n": types.AcceptSuggestedFeatureDocument,
    "\n  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {\n    rejectSuggestedFeature(input: $input)\n  }\n": types.RejectSuggestedFeatureDocument,
    "\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": types.SaveReleaseSummaryDocument,
    "\n  mutation GeneratePrSummary($prId: ID!) {\n    generatePrSummary(prId: $prId) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": types.GeneratePrSummaryDocument,
    "\n  mutation SavePrSummary($input: SavePrSummaryInput!) {\n    savePrSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n": types.SavePrSummaryDocument,
    "\n  mutation DeleteRelease($releaseId: ID!) {\n    deleteRelease(releaseId: $releaseId) {\n      id\n    }\n  }\n": types.DeleteReleaseDocument,
    "\n  mutation RegenerateDraft($releaseId: ID!, $resume: Boolean!) {\n    regenerateDraft(releaseId: $releaseId, resume: $resume) {\n      id\n      aiDraftStatus\n    }\n  }\n": types.RegenerateDraftDocument,
    "\n  mutation SetReleaseStatus($input: SetReleaseStatusInput!) {\n    setReleaseStatus(input: $input) {\n      id\n      status\n    }\n  }\n": types.SetReleaseStatusDocument,
    "\n  query GetReleases($projectId: ID!) {\n    getReleases(projectId: $projectId) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetReleasesDocument,
    "\n  query GetRelease($id: ID!) {\n    getRelease(id: $id) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetReleaseDocument,
    "\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        aiDraftStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n        }\n      }\n    }\n  }\n": types.GetReleaseTreeDocument,
    "\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n": types.GetCoverageDocument,
    "\n  query ExportSummary($input: ExportSummaryInput!) {\n    exportSummary(input: $input) {\n      url\n      filename\n    }\n  }\n": types.ExportSummaryDocument,
    "\n  query SuggestFeatureForPr($prId: ID!) {\n    suggestFeatureForPr(prId: $prId) {\n      featureId\n      confidence\n      rationale\n    }\n  }\n": types.SuggestFeatureForPrDocument,
    "\n  subscription GenerateSummary($input: GenerateSummaryInput!) {\n    generateSummary(input: $input) {\n      chunk\n      done\n    }\n  }\n": types.GenerateSummaryDocument,
    "\n  query GithubBranches($projectId: ID!) {\n    githubBranches(projectId: $projectId) {\n      name\n      protected\n      commitSha\n    }\n  }\n": types.GithubBranchesDocument,
    "\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n": types.CompareRefsDocument,
    "\n  query DiffRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    diffRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      id\n      number\n      title\n      body\n      author\n      mergedAt\n      releaseId\n      featureId\n      tickets {\n        issueId\n        source\n        url\n        title\n        confidence\n      }\n      commits {\n        sha\n        message\n        author\n        date\n      }\n    }\n  }\n": types.DiffRefsDocument,
    "\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n": types.GetConnectionSettingsDocument,
    "\n  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {\n    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {\n      id\n      name\n    }\n  }\n": types.FlagsmithProjectsDocument,
    "\n  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {\n    updateConnectionSettings(input: $input) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n": types.UpdateConnectionSettingsDocument,
    "\n  query ProjectTags($projectId: ID!) {\n    projectTags(projectId: $projectId) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": types.ProjectTagsDocument,
    "\n  mutation CreateProjectTag($input: CreateProjectTagInput!) {\n    createProjectTag(input: $input) {\n      id\n      name\n      color\n      createdAt\n    }\n  }\n": types.CreateProjectTagDocument,
    "\n  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {\n    deleteProjectTag(input: $input)\n  }\n": types.DeleteProjectTagDocument,
    "\n  query GithubConnection {\n    githubConnection {\n      connected\n      githubLogin\n    }\n  }\n": types.GithubConnectionDocument,
    "\n  query GithubAuthorizeUrl {\n    githubAuthorizeUrl\n  }\n": types.GithubAuthorizeUrlDocument,
    "\n  mutation DisconnectGithub {\n    disconnectGithub\n  }\n": types.DisconnectGithubDocument,
    "\n  mutation ReauthorizeGithub {\n    reauthorizeGithub\n  }\n": types.ReauthorizeGithubDocument,
    "\n  query LinearConnection($projectId: ID!) {\n    linearConnection(projectId: $projectId) {\n      connected\n      linearUser\n    }\n  }\n": types.LinearConnectionDocument,
    "\n  query LinearAuthorizeUrl($projectId: ID!) {\n    linearAuthorizeUrl(projectId: $projectId)\n  }\n": types.LinearAuthorizeUrlDocument,
    "\n  mutation DisconnectLinear($projectId: ID!) {\n    disconnectLinear(projectId: $projectId)\n  }\n": types.DisconnectLinearDocument,
    "\n  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {\n    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {\n      ok\n      projectName\n      environments\n      hasStaging\n      hasProduction\n      warnings\n      message\n    }\n  }\n": types.VerifyFlagsmithConnectionDocument,
    "\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n": types.ListProjectsDocument,
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
export function graphql(source: "\n  query ListMembers($projectId: ID!) {\n    listMembers(projectId: $projectId) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query ListMembers($projectId: ID!) {\n    listMembers(projectId: $projectId) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListInvitations($projectId: ID!) {\n    listInvitations(projectId: $projectId) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query ListInvitations($projectId: ID!) {\n    listInvitations(projectId: $projectId) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation InviteMember($input: InviteMemberInput!) {\n    inviteMember(input: $input) {\n      id\n      email\n      projectId\n      role\n      status\n      expiresAt\n      invitedById\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {\n    updateMemberRole(input: $input) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation AcceptInvitation($token: String!) {\n    acceptInvitation(token: $token) {\n      id\n      userId\n      projectId\n      role\n      name\n      email\n      avatarUrl\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFeature($input: CreateFeatureInput!) {\n    createFeature(input: $input) {\n      id\n      projectId\n      name\n      description\n      kind\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AssignPrToFeature($input: AssignPrToFeatureInput!) {\n    assignPrToFeature(input: $input)\n  }\n"): (typeof documents)["\n  mutation AssignPrToFeature($input: AssignPrToFeatureInput!) {\n    assignPrToFeature(input: $input)\n  }\n"];
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
export function graphql(source: "\n  query ListFeatures($projectId: ID!) {\n    listFeatures(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      kind\n      suggested\n      tags\n      currentState\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query ListFeatures($projectId: ID!) {\n    listFeatures(projectId: $projectId) {\n      id\n      projectId\n      name\n      description\n      kind\n      suggested\n      tags\n      currentState\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFeature($id: ID!) {\n    getFeature(id: $id) {\n      feature {\n        id\n        projectId\n        name\n        description\n        kind\n        suggested\n        tags\n        currentState\n        createdAt\n        updatedAt\n      }\n      releases {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        createdAt\n      }\n      prs {\n        id\n        number\n        title\n        author\n        mergedAt\n        releaseId\n        body\n        tickets {\n          issueId\n          source\n          url\n          title\n          confidence\n        }\n        commits {\n          sha\n          message\n          author\n          date\n        }\n      }\n      snapshots {\n        releaseId\n        state\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      items {\n        key\n        createdAt\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFlags($input: GetFlagsInput!) {\n    getFlags(input: $input) {\n      environments\n      totalCount\n      items {\n        key\n        createdAt\n        environments {\n          name\n          enabled\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled }\n        divergences { name enabled }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {\n    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {\n      baselineEnvironments\n      comparedEnvironments\n      items {\n        key\n        createdAt\n        baselineEnabled\n        baselineConflict\n        baseline { name enabled }\n        divergences { name enabled }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GithubRepositories {\n    githubRepositories {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n"): (typeof documents)["\n  query GithubRepositories {\n    githubRepositories {\n      fullName\n      name\n      owner\n      private\n      defaultBranch\n      description\n      htmlUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      repo\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation ShipRelease($input: ShipReleaseInput!) {\n    shipRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      projectId\n    }\n  }\n"): (typeof documents)["\n  mutation ShipRelease($input: ShipReleaseInput!) {\n    shipRelease(input: $input) {\n      id\n      name\n      status\n      tags\n      prUrl\n      projectId\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n"): (typeof documents)["\n  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {\n    saveReleaseSummary(input: $input) {\n      id\n      summary\n      summaryEditedAt\n    }\n  }\n"];
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
export function graphql(source: "\n  query GetReleases($projectId: ID!) {\n    getReleases(projectId: $projectId) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetReleases($projectId: ID!) {\n    getReleases(projectId: $projectId) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRelease($id: ID!) {\n    getRelease(id: $id) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetRelease($id: ID!) {\n    getRelease(id: $id) {\n      id\n      name\n      baseRef\n      compareRef\n      status\n      tags\n      prUrl\n      projectId\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        aiDraftStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetReleaseTree($id: ID!) {\n    getReleaseTree(id: $id) {\n      release {\n        id\n        name\n        baseRef\n        compareRef\n        status\n        tags\n        prUrl\n        summary\n        summaryEditedAt\n        aiDraftStatus\n        projectId\n        createdAt\n        updatedAt\n      }\n      features {\n        feature {\n          id\n          name\n          description\n          kind\n          suggested\n          currentState\n          tags\n        }\n        state\n        clientAvailabilityKey\n        flagState {\n          staging\n          production\n        }\n        prs {\n          id\n          number\n          title\n          url\n          body\n          author\n          mergedAt\n          releaseId\n          featureId\n          aiConfidence\n          aiRationale\n          summary\n          summaryEditedAt\n          tickets {\n            issueId\n            source\n            url\n            title\n            description\n            confidence\n          }\n          commits {\n            sha\n            message\n            author\n            date\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n"): (typeof documents)["\n  query GetCoverage($releaseId: ID!) {\n    getCoverage(releaseId: $releaseId) {\n      total\n      assigned\n      ready\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ExportSummary($input: ExportSummaryInput!) {\n    exportSummary(input: $input) {\n      url\n      filename\n    }\n  }\n"): (typeof documents)["\n  query ExportSummary($input: ExportSummaryInput!) {\n    exportSummary(input: $input) {\n      url\n      filename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SuggestFeatureForPr($prId: ID!) {\n    suggestFeatureForPr(prId: $prId) {\n      featureId\n      confidence\n      rationale\n    }\n  }\n"): (typeof documents)["\n  query SuggestFeatureForPr($prId: ID!) {\n    suggestFeatureForPr(prId: $prId) {\n      featureId\n      confidence\n      rationale\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription GenerateSummary($input: GenerateSummaryInput!) {\n    generateSummary(input: $input) {\n      chunk\n      done\n    }\n  }\n"): (typeof documents)["\n  subscription GenerateSummary($input: GenerateSummaryInput!) {\n    generateSummary(input: $input) {\n      chunk\n      done\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GithubBranches($projectId: ID!) {\n    githubBranches(projectId: $projectId) {\n      name\n      protected\n      commitSha\n    }\n  }\n"): (typeof documents)["\n  query GithubBranches($projectId: ID!) {\n    githubBranches(projectId: $projectId) {\n      name\n      protected\n      commitSha\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      aheadBy\n      behindBy\n      totalCommits\n      commits {\n        sha\n        message\n        author\n        committedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DiffRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    diffRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      id\n      number\n      title\n      body\n      author\n      mergedAt\n      releaseId\n      featureId\n      tickets {\n        issueId\n        source\n        url\n        title\n        confidence\n      }\n      commits {\n        sha\n        message\n        author\n        date\n      }\n    }\n  }\n"): (typeof documents)["\n  query DiffRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {\n    diffRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {\n      id\n      number\n      title\n      body\n      author\n      mergedAt\n      releaseId\n      featureId\n      tickets {\n        issueId\n        source\n        url\n        title\n        confidence\n      }\n      commits {\n        sha\n        message\n        author\n        date\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n"): (typeof documents)["\n  query GetConnectionSettings($projectId: ID!) {\n    getConnectionSettings(projectId: $projectId) {\n      githubConnected\n      flagsmithConnected\n      flagsmithUrl\n      flagsmithProjectId\n      linearConnected\n    }\n  }\n"];
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
export function graphql(source: "\n  query GithubConnection {\n    githubConnection {\n      connected\n      githubLogin\n    }\n  }\n"): (typeof documents)["\n  query GithubConnection {\n    githubConnection {\n      connected\n      githubLogin\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GithubAuthorizeUrl {\n    githubAuthorizeUrl\n  }\n"): (typeof documents)["\n  query GithubAuthorizeUrl {\n    githubAuthorizeUrl\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DisconnectGithub {\n    disconnectGithub\n  }\n"): (typeof documents)["\n  mutation DisconnectGithub {\n    disconnectGithub\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReauthorizeGithub {\n    reauthorizeGithub\n  }\n"): (typeof documents)["\n  mutation ReauthorizeGithub {\n    reauthorizeGithub\n  }\n"];
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
export function graphql(source: "\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"): (typeof documents)["\n  query ListProjects {\n    listProjects {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetProject($id: ID!) {\n    getProject(id: $id) {\n      id\n      name\n      repo\n      connectionHealth {\n        github\n        linear\n        flagsmith\n      }\n      integrations {\n        github\n        linear\n        flagsmith\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;