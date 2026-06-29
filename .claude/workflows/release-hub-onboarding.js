export const meta = {
  name: 'release-hub-onboarding',
  description: 'Build the resumable post-registration onboarding: register page, mandatory GitHub connect, repo-picker create-project, and the server-state-driven gate',
  whenToUse: 'Run to implement Release Hub onboarding (register + connect GitHub + pick repo to create the first project, with a resumable guard).',
  phases: [
    { title: 'Backend', detail: 'githubRepositories query (Octokit) + GraphQL type + resolver, regen schema.gql, typecheck' },
    { title: 'Frontend', detail: 'Register page + /onboarding stages + resumable gate + routes + i18n + codegen + typecheck' },
  ],
}

phase('Backend')

const backend = await agent(
  `Build the backend for Release Hub onboarding in apps/api. Authorization is purely project-scoped now (no platform UserRole). The GitHub per-user OAuth connection already exists (model GithubConnection: encrypted accessToken, githubLogin). Read these to follow existing patterns: apps/api/src/modules/integration/github.client.ts (+ interfaces/github-client.interface.ts), apps/api/src/common/crypto/token-cipher.ts (decryptToken), apps/api/src/modules/github-auth/ (its repository that loads a user's GithubConnection, its resolver, its query handlers like get-github-connection), apps/api/src/modules/release/queries/diff-refs/diff-refs.handler.ts (how it throws GITHUB_NOT_CONNECTED via AppException + ErrorCode when the user has no connection), and apps/api/src/common/cqrs/ (BaseQueryHandler, transactional pattern).

Deliver a new authenticated GraphQL query that lists the connected user's GitHub repositories:

1. GitHub client: add a method to IGitHubClient and its impl GitHubClient: \`listUserRepositories(accessToken: string): Promise<IGithubRepository[]>\`. Implement with Octokit: \`new Octokit({ auth: accessToken })\` then \`octokit.paginate(octokit.repos.listForAuthenticatedUser, { sort: 'updated', per_page: 100, affiliation: 'owner,collaborator,organization_member' })\`, capped at the first ~200 results. Map each repo to \`IGithubRepository\` = { fullName: string (repo.full_name), name: string, owner: string (repo.owner.login), private: boolean, defaultBranch: string (repo.default_branch), description: string | null, htmlUrl: string (repo.html_url) }. Put IGithubRepository in the module's interfaces file.

2. CQRS query: create apps/api/src/modules/github-auth/queries/list-github-repositories/ with ListGithubRepositoriesQuery(userId: string) and a QueryHandler extending BaseQueryHandler, transactional. It loads the caller's GithubConnection via the github-auth repository; if none, throw the SAME GITHUB_NOT_CONNECTED AppException/ErrorCode that diff-refs uses; otherwise decrypt the token with decryptToken and return \`client.listUserRepositories(token)\`. No project scoping (these are the user's own repos) — but it must be an authenticated resolver.

3. GraphQL @ObjectType: create GithubRepositoryType in apps/api/src/modules/github-auth/types/ with fields fullName, name, owner (String!), private (Boolean!), defaultBranch (String!), description (String, nullable), htmlUrl (String!).

4. Resolver: add \`@Query(() => [GithubRepositoryType]) githubRepositories(@CurrentUser() user: IJwtUser)\` to the github-auth resolver, dispatching ListGithubRepositoriesQuery(user.id) via the QueryBus. Authenticate it exactly like the existing githubConnection query (same guard pattern). No @Can / project condition.

5. Wire the new handler into the github-auth module providers.

6. The turbo dev server is running and regenerates apps/api/src/schema.gql on save; after your changes, CONFIRM schema.gql contains \`githubRepositories: [GithubRepositoryType!]!\` and \`type GithubRepositoryType\`. If it did not regenerate, build/boot the api once to emit it.

7. Run \`pnpm --filter @release-hub/api typecheck\` until clean.

HARD RULES: CQRS + IoC (abstract DI tokens, required tx), no comments, no any, no @ts-ignore, no magic strings, explicit types. NEVER create test files (no *.test.* / *.spec.*) — verification is typecheck + confirming schema.gql only. Report: files created/changed, the new SDL for the query+type, and the typecheck result.`,
  { agentType: 'backend', label: 'github-repositories-query', phase: 'Backend' },
)

phase('Frontend')

const frontend = await agent(
  `Build the frontend for Release Hub onboarding in apps/web. The backend now exposes: the existing \`register(input: RegisterInput!): AuthTokensType!\` mutation (RegisterInput = { email, password, name }); the existing \`me\` query (id, email, name, avatarUrl — NO role anymore); the existing \`githubConnection { connected, githubLogin }\` query; the existing \`listProjects\` query; the existing \`createProject(input: { name, repo }): ProjectType\` mutation; and a NEW \`githubRepositories: [GithubRepositoryType!]!\` query where GithubRepositoryType = { fullName, name, owner, private, defaultBranch, description, htmlUrl } (throws a GITHUB_NOT_CONNECTED error if GitHub isn't connected). Authorization is purely project-scoped; there is no platform role.

Study these first to match conventions: apps/web/src/features/auth/LoginPage.tsx (Nebula auth screen style + token storage + me-fetch + navigate), apps/web/src/features/auth/graphql/auth.operations.ts (graphql() operation style, ME_QUERY), apps/web/src/lib/routes.ts + apps/web/src/router/routes.tsx + apps/web/src/router/ProtectedLayout.tsx (routing + ProjectProvider/ProjectAbilitySync), apps/web/src/context/project.context.tsx (useProject -> projects/activeProject/loading), apps/web/src/features/settings/hooks/use-github-connection.ts (connect() redirects to authorize URL) + apps/web/src/features/settings/graphql/settings.operations.ts (GITHUB_CONNECTION query), and the Nebula components (NebulaBackground, GlassCard, GradientButton) + the nebula-design skill.

DELIVER (use shadcn/ui primitives only; install missing ones with \`pnpm dlx shadcn@latest add <c>\`; all UI text via useTranslation; no hardcoded strings):

1. REGISTER PAGE — route \`/register\` (public, like /login). Component RegisterPage in features/auth. Fields: name, email, password (reuse the existing common.json auth.* keys: createAccount, name, registerButton, registerError, alreadyHaveAccount, signIn). Add REGISTER_MUTATION to auth.operations.ts. On submit: call register, store accessToken/refreshToken in localStorage exactly like LoginPage, fetch me to populate auth context, then navigate to the app root so the onboarding gate takes over. Show registerError on failure (handle EMAIL_ALREADY_EXISTS via extensions.code with a friendly message). Add a link from LoginPage to /register ("Don't have an account? Sign up") and from RegisterPage back to /login, using the existing auth.* keys.

2. ONBOARDING — a SINGLE route \`/onboarding\` (authenticated) that is server-state-driven and resumable. Create an OnboardingPage that runs the GITHUB_CONNECTION query and useProject():
   - while either is loading -> a centered Nebula loader (no premature redirect).
   - if the user already has >= 1 project -> <Navigate to="/dashboard" replace/>.
   - else if GitHub is NOT connected -> render the ConnectGithubStage.
   - else (connected, 0 projects) -> render the SelectRepoStage.
   ConnectGithubStage: a Nebula screen explaining GitHub is REQUIRED, with a single "Connect GitHub" button that uses the existing use-github-connection connect() (redirects to GitHub). It must be impossible to skip.
   SelectRepoStage: runs the new GITHUB_REPOSITORIES query, shows a searchable repo list (use shadcn Command / combobox; show fullName + private badge + description). Selecting a repo calls CREATE_PROJECT with { repo: <fullName>, name: <editable, default = repo name> }; on success navigate to /dashboard. Add GITHUB_REPOSITORIES and CREATE_PROJECT (and a typed listProjects refetch) operations to a features/onboarding graphql file.

3. RESUMABLE GATE — add an OnboardingGate that wraps the main protected app (inside ProtectedLayout, after ProjectProvider so projects + githubConnection are available). The gate, once both the githubConnection query and projects have loaded, redirects to \`/onboarding\` whenever (!githubConnected || projects.length === 0). The \`/onboarding\` route itself must NOT be wrapped by the gate (avoid redirect loops) — it only requires auth. Net effect: a user who quits mid-onboarding and returns is always sent back to the correct stage; a fully-onboarded user never sees /onboarding. Keep ProtectedLayout's existing auth redirect to /login for unauthenticated users.

4. ROUTES + i18n: add LOGIN-sibling \`REGISTER: '/register'\` and \`ONBOARDING: '/onboarding'\` to routes.ts and wire them in routes.tsx (register public; onboarding auth-only but outside the gate). Create an \`onboarding\` i18n namespace (apps/web/src/i18n/en/onboarding.json + es/onboarding.json) for the stage copy, and register it in the i18n index. Reuse common.json auth.* for the register form.

5. Run \`pnpm --filter @release-hub/web generate\` (codegen) AFTER adding all operations, then \`pnpm --filter @release-hub/web typecheck\` until 0 errors.

HARD RULES: shadcn/ui first; Nebula design language; all text via i18n; no comments; no any; no @ts-ignore; no magic strings; do NOT edit apps/web/src/generated by hand. NEVER create test files (no *.test.* / *.spec.*) — verify via codegen + typecheck only. Report: files created/changed, the new operations added, codegen result, and the final web typecheck result.`,
  { agentType: 'frontend', label: 'onboarding-pages', phase: 'Frontend' },
)

return { backend, frontend }
