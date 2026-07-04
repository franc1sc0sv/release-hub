import { graphql } from '@/generated/gql'

export const GET_CONNECTION_SETTINGS = graphql(`
  query GetConnectionSettings($projectId: ID!) {
    getConnectionSettings(projectId: $projectId) {
      githubConnected
      flagsmithConnected
      flagsmithUrl
      flagsmithProjectId
      linearConnected
      flagsmithWebhookPath
      flagsmithWebhookSecretSet
    }
  }
`)

export const FLAGSMITH_PROJECTS = graphql(`
  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {
    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {
      id
      name
    }
  }
`)

export const UPDATE_CONNECTION_SETTINGS = graphql(`
  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {
    updateConnectionSettings(input: $input) {
      githubConnected
      flagsmithConnected
      flagsmithUrl
      flagsmithProjectId
      linearConnected
    }
  }
`)

export const PROJECT_TAGS = graphql(`
  query ProjectTags($projectId: ID!) {
    projectTags(projectId: $projectId) {
      id
      name
      color
      createdAt
    }
  }
`)

export const CREATE_PROJECT_TAG = graphql(`
  mutation CreateProjectTag($input: CreateProjectTagInput!) {
    createProjectTag(input: $input) {
      id
      name
      color
      createdAt
    }
  }
`)

export const DELETE_PROJECT_TAG = graphql(`
  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {
    deleteProjectTag(input: $input)
  }
`)

export const GITHUB_CONNECTION = graphql(`
  query GithubConnection {
    githubConnection {
      connected
      githubLogin
    }
  }
`)

export const GITHUB_AUTHORIZE_URL = graphql(`
  query GithubAuthorizeUrl {
    githubAuthorizeUrl
  }
`)

export const DISCONNECT_GITHUB = graphql(`
  mutation DisconnectGithub {
    disconnectGithub
  }
`)

export const REAUTHORIZE_GITHUB = graphql(`
  mutation ReauthorizeGithub {
    reauthorizeGithub
  }
`)

export const LINEAR_CONNECTION = graphql(`
  query LinearConnection($projectId: ID!) {
    linearConnection(projectId: $projectId) {
      connected
      linearUser
    }
  }
`)

export const LINEAR_AUTHORIZE_URL = graphql(`
  query LinearAuthorizeUrl($projectId: ID!) {
    linearAuthorizeUrl(projectId: $projectId)
  }
`)

export const DISCONNECT_LINEAR = graphql(`
  mutation DisconnectLinear($projectId: ID!) {
    disconnectLinear(projectId: $projectId)
  }
`)

export const VERIFY_FLAGSMITH_CONNECTION = graphql(`
  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {
    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {
      ok
      projectName
      environments
      hasStaging
      hasProduction
      warnings
      message
    }
  }
`)

export const REPO_FILE_SEARCH = graphql(`
  query RepoFileSearch($input: RepoFileSearchInput!) {
    repoFileSearch(input: $input)
  }
`)

export const SET_FLAG_REGISTRY = graphql(`
  mutation SetFlagRegistry($input: SetFlagRegistryInput!) {
    setFlagRegistry(input: $input) {
      projectId
      flagRegistryPath
      flagRegistryBranch
    }
  }
`)

export const FLAG_REGISTRY = graphql(`
  query FlagRegistry($projectId: ID!) {
    flagRegistry(projectId: $projectId) {
      projectId
      flagRegistryPath
      flagRegistryBranch
    }
  }
`)

export const ROTATE_FLAGSMITH_WEBHOOK_SECRET = graphql(`
  mutation RotateFlagsmithWebhookSecret($projectId: ID!) {
    rotateFlagsmithWebhookSecret(projectId: $projectId) {
      flagsmithWebhookPath
      flagsmithWebhookSecretSet
    }
  }
`)

export const SLACK_CONNECTION = graphql(`
  query SlackConnection($projectId: ID!) {
    slackConnection(projectId: $projectId) {
      connected
      teamName
      channelId
      channelName
      notifyOnCreated
      notifyOnShipped
      notifyOnDeployed
    }
  }
`)

export const SLACK_AUTHORIZE_URL = graphql(`
  query SlackAuthorizeUrl($projectId: ID!) {
    slackAuthorizeUrl(projectId: $projectId)
  }
`)

export const SLACK_CHANNELS = graphql(`
  query SlackChannels($projectId: ID!) {
    slackChannels(projectId: $projectId) {
      id
      name
    }
  }
`)

export const DISCONNECT_SLACK = graphql(`
  mutation DisconnectSlack($projectId: ID!) {
    disconnectSlack(projectId: $projectId)
  }
`)

export const SET_SLACK_CHANNEL = graphql(`
  mutation SetSlackChannel($projectId: ID!, $channelId: String!, $channelName: String!) {
    setSlackChannel(projectId: $projectId, channelId: $channelId, channelName: $channelName) {
      connected
      teamName
      channelId
      channelName
      notifyOnCreated
      notifyOnShipped
      notifyOnDeployed
    }
  }
`)

export const UPDATE_SLACK_NOTIFICATION_SETTINGS = graphql(`
  mutation UpdateSlackNotificationSettings(
    $projectId: ID!
    $notifyOnCreated: Boolean!
    $notifyOnShipped: Boolean!
    $notifyOnDeployed: Boolean!
  ) {
    updateSlackNotificationSettings(
      projectId: $projectId
      notifyOnCreated: $notifyOnCreated
      notifyOnShipped: $notifyOnShipped
      notifyOnDeployed: $notifyOnDeployed
    ) {
      connected
      teamName
      channelId
      channelName
      notifyOnCreated
      notifyOnShipped
      notifyOnDeployed
    }
  }
`)

export const SEND_SLACK_TEST_MESSAGE = graphql(`
  mutation SendSlackTestMessage($projectId: ID!) {
    sendSlackTestMessage(projectId: $projectId) {
      ok
      error
    }
  }
`)

export const NOTIFICATION_PREFERENCES = graphql(`
  query NotificationPreferences($projectId: ID!) {
    notificationPreferences(projectId: $projectId) {
      notificationType
      channel
      enabled
      digestFrequency
    }
  }
`)

export const UPDATE_NOTIFICATION_PREFERENCE = graphql(`
  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {
    updateNotificationPreference(input: $input) {
      notificationType
      channel
      enabled
      digestFrequency
    }
  }
`)

export const TRIGGER_FLAG_DIGEST = graphql(`
  mutation TriggerFlagDigest($projectId: ID!) {
    triggerFlagDigest(projectId: $projectId)
  }
`)

export const GET_PROJECT_FLAG_REMINDER = graphql(`
  query GetProjectFlagReminder($id: ID!) {
    getProject(id: $id) {
      id
      flagReminderIntervalDays
    }
  }
`)

export const UPDATE_PROJECT_FLAG_REMINDER = graphql(`
  mutation UpdateProjectFlagReminder($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      flagReminderIntervalDays
    }
  }
`)
