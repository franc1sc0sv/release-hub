import { config } from 'dotenv'
import { resolve } from 'node:path'
import { PrismaClient } from '../src/generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { DEFAULT_FEATURES } from '../src/default-features'

config({ path: resolve(__dirname, '../../../.env') })

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const SALT_ROUNDS = 10

async function seedUsers() {
  const adminHash = await hash('Admin123!', SALT_ROUNDS)
  const userHash = await hash('User123!', SALT_ROUNDS)
  const memberHash = await hash('Member123!', SALT_ROUNDS)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@release-hub.dev' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@release-hub.dev',
      password: adminHash,
    },
  })

  const alice = await prisma.user.upsert({
    where: { email: 'alice@release-hub.dev' },
    update: {},
    create: {
      name: 'Alice Chen',
      email: 'alice@release-hub.dev',
      password: userHash,
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@release-hub.dev' },
    update: {},
    create: {
      name: 'Bob Martinez',
      email: 'bob@release-hub.dev',
      password: memberHash,
    },
  })

  const carol = await prisma.user.upsert({
    where: { email: 'carol@release-hub.dev' },
    update: {},
    create: {
      name: 'Carol Singh',
      email: 'carol@release-hub.dev',
      password: memberHash,
    },
  })

  return { admin, alice, bob, carol }
}

async function seedProjects(adminId: string, aliceId: string, bobId: string, carolId: string) {
  const purco = await prisma.project.upsert({
    where: { id: 'seed-project-purco' },
    update: {},
    create: {
      id: 'seed-project-purco',
      name: 'PurCo Platform',
      repo: 'purco-org/platform',
      flagsmithEnabled: false,
      linearEnabled: false,
    },
  })

  const sdi = await prisma.project.upsert({
    where: { id: 'seed-project-sdi' },
    update: {},
    create: {
      id: 'seed-project-sdi',
      name: 'SDI Services',
      repo: 'sdi-org/services',
      flagsmithEnabled: false,
      linearEnabled: false,
    },
  })

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: adminId, projectId: purco.id } },
    update: {},
    create: { userId: adminId, projectId: purco.id, role: 'owner' },
  })

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: aliceId, projectId: purco.id } },
    update: {},
    create: { userId: aliceId, projectId: purco.id, role: 'member' },
  })

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: bobId, projectId: purco.id } },
    update: {},
    create: { userId: bobId, projectId: purco.id, role: 'member' },
  })

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: carolId, projectId: purco.id } },
    update: {},
    create: { userId: carolId, projectId: purco.id, role: 'viewer' },
  })

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: adminId, projectId: sdi.id } },
    update: {},
    create: { userId: adminId, projectId: sdi.id, role: 'owner' },
  })

  await prisma.membership.upsert({
    where: { userId_projectId: { userId: aliceId, projectId: sdi.id } },
    update: {},
    create: { userId: aliceId, projectId: sdi.id, role: 'member' },
  })

  return { purco, sdi }
}

const SEED_FEATURE_IDS: Record<string, string> = {
  'Infra Changes': 'infra',
  'Integration Tests': 'int-tests',
  'E2E Tests': 'e2e',
  'Dev/Chore': 'chore',
}

async function seedDefaultFeatures(projectId: string, projectPrefix: string) {
  const features: Record<string, { id: string }> = {}

  for (const def of DEFAULT_FEATURES) {
    const idSuffix = SEED_FEATURE_IDS[def.name]
    const id = `seed-feat-${projectPrefix}-${idSuffix}`
    const feature = await prisma.feature.upsert({
      where: { id },
      update: {},
      create: {
        id,
        projectId,
        name: def.name,
        description: def.description,
        category: def.category,
        kind: def.kind,
        tags: [],
      },
    })
    features[id] = feature
  }

  return features
}

async function seedProductFeatures(projectId: string, projectPrefix: string) {
  const productFeatures = [
    {
      id: `seed-feat-${projectPrefix}-auth`,
      name: 'Auth & SSO',
      description: 'User authentication, single sign-on, JWT refresh, magic-link login, and session management.',
      category: 'Product' as const,
      tags: ['PurCo'],
    },
    {
      id: `seed-feat-${projectPrefix}-dashboard`,
      name: 'Release Dashboard',
      description: 'Main release overview dashboard with release health indicators, coverage gauge, and feature assignment board.',
      category: 'Product' as const,
      tags: ['PurCo', 'SDI'],
    },
    {
      id: `seed-feat-${projectPrefix}-pr-assign`,
      name: 'PR Assignment Flow',
      description: 'Drag-and-drop PR to feature assignment with AI suggestion and coverage enforcement.',
      category: 'Product' as const,
      tags: ['PurCo'],
    },
  ]

  const features: Record<string, { id: string }> = {}
  for (const feat of productFeatures) {
    const feature = await prisma.feature.upsert({
      where: { id: feat.id },
      update: {},
      create: {
        id: feat.id,
        projectId,
        name: feat.name,
        description: feat.description,
        category: feat.category,
        kind: 'product',
        tags: feat.tags,
      },
    })
    features[feat.id] = feature
  }

  return features
}

async function seedPurcoReleases(
  projectId: string,
  defaultFeatures: Record<string, { id: string }>,
  productFeatures: Record<string, { id: string }>,
) {
  const v180 = await prisma.release.upsert({
    where: { id: 'seed-release-purco-v180' },
    update: {},
    create: {
      id: 'seed-release-purco-v180',
      projectId,
      name: 'v1.8.0',
      baseRef: 'main',
      compareRef: 'develop',
      type: 'feature',
      status: 'merged',
      tag: 'v1.8.0',
    },
  })

  const v181 = await prisma.release.upsert({
    where: { id: 'seed-release-purco-v181' },
    update: {},
    create: {
      id: 'seed-release-purco-v181',
      projectId,
      name: 'v1.8.1',
      baseRef: 'v1.8.0',
      compareRef: 'develop',
      type: 'hotfix',
      status: 'deployed',
      tag: 'v1.8.1',
    },
  })

  const v190 = await prisma.release.upsert({
    where: { id: 'seed-release-purco-v190' },
    update: {},
    create: {
      id: 'seed-release-purco-v190',
      projectId,
      name: 'v1.9.0',
      baseRef: 'main',
      compareRef: 'develop',
      type: 'feature',
      status: 'draft',
    },
  })

  const infraFeatId = `seed-feat-purco-infra`
  const choreFeatId = `seed-feat-purco-chore`
  const authFeatId = `seed-feat-purco-auth`
  const dashFeatId = `seed-feat-purco-dashboard`
  const prAssignFeatId = `seed-feat-purco-pr-assign`

  await prisma.featureInRelease.upsert({
    where: { featureId_releaseId: { featureId: infraFeatId, releaseId: v180.id } },
    update: {},
    create: { featureId: infraFeatId, releaseId: v180.id, state: 'fully_released' },
  })
  await prisma.featureInRelease.upsert({
    where: { featureId_releaseId: { featureId: authFeatId, releaseId: v180.id } },
    update: {},
    create: { featureId: authFeatId, releaseId: v180.id, state: 'fully_released' },
  })
  await prisma.featureInRelease.upsert({
    where: { featureId_releaseId: { featureId: choreFeatId, releaseId: v181.id } },
    update: {},
    create: { featureId: choreFeatId, releaseId: v181.id, state: 'fully_released' },
  })
  await prisma.featureInRelease.upsert({
    where: { featureId_releaseId: { featureId: dashFeatId, releaseId: v190.id } },
    update: {},
    create: { featureId: dashFeatId, releaseId: v190.id, state: 'in_progress' },
  })
  await prisma.featureInRelease.upsert({
    where: { featureId_releaseId: { featureId: prAssignFeatId, releaseId: v190.id } },
    update: {},
    create: { featureId: prAssignFeatId, releaseId: v190.id, state: 'in_progress' },
  })
  await prisma.featureInRelease.upsert({
    where: { featureId_releaseId: { featureId: infraFeatId, releaseId: v190.id } },
    update: {},
    create: { featureId: infraFeatId, releaseId: v190.id, state: 'in_progress' },
  })

  return { v180, v181, v190 }
}

type PrSeedInput = {
  id: string
  number: number
  title: string
  body: string
  author: string
  mergedAt: Date
  releaseId: string
  featureId: string | null
  commits: Array<{ sha: string; message: string; author: string; committedAt: Date }>
}

async function seedPullRequest(input: PrSeedInput) {
  const pr = await prisma.pullRequest.upsert({
    where: { id: input.id },
    update: {},
    create: {
      id: input.id,
      number: input.number,
      title: input.title,
      body: input.body,
      author: input.author,
      mergedAt: input.mergedAt,
      releaseId: input.releaseId,
      featureId: input.featureId,
    },
  })

  for (const commit of input.commits) {
    await prisma.commit.upsert({
      where: { pullRequestId_sha: { pullRequestId: pr.id, sha: commit.sha } },
      update: {},
      create: {
        pullRequestId: pr.id,
        sha: commit.sha,
        message: commit.message,
        author: commit.author,
        committedAt: commit.committedAt,
      },
    })
  }

  return pr
}

async function seedPullRequests(v180Id: string, v181Id: string, v190Id: string) {
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

  const prs: PrSeedInput[] = [
    {
      id: 'seed-pr-1',
      number: 101,
      title: 'feat: add magic-link login flow',
      body: 'Implements OTP-based magic-link authentication with bcrypt code hashing and expiry.',
      author: 'alice',
      mergedAt: daysAgo(30),
      releaseId: v180Id,
      featureId: 'seed-feat-purco-auth',
      commits: [
        { sha: 'abc1001', message: 'feat: add login code model and service', author: 'alice', committedAt: daysAgo(32) },
        { sha: 'abc1002', message: 'feat: wire magic-link email sending', author: 'alice', committedAt: daysAgo(31) },
        { sha: 'abc1003', message: 'fix: handle expired codes gracefully', author: 'alice', committedAt: daysAgo(30) },
      ],
    },
    {
      id: 'seed-pr-2',
      number: 102,
      title: 'feat: JWT refresh token rotation',
      body: 'Adds refresh token model with revocation support and sliding expiry.',
      author: 'bob',
      mergedAt: daysAgo(29),
      releaseId: v180Id,
      featureId: 'seed-feat-purco-auth',
      commits: [
        { sha: 'abc2001', message: 'feat: add refresh_tokens table', author: 'bob', committedAt: daysAgo(31) },
        { sha: 'abc2002', message: 'feat: implement token rotation on refresh', author: 'bob', committedAt: daysAgo(29) },
      ],
    },
    {
      id: 'seed-pr-3',
      number: 103,
      title: 'chore: upgrade Node to 20.19 LTS',
      body: 'Updates .nvmrc, Dockerfiles, and CI matrix to Node 20.19.',
      author: 'alice',
      mergedAt: daysAgo(28),
      releaseId: v180Id,
      featureId: 'seed-feat-purco-infra',
      commits: [
        { sha: 'abc3001', message: 'chore: bump node version to 20.19', author: 'alice', committedAt: daysAgo(28) },
      ],
    },
    {
      id: 'seed-pr-4',
      number: 104,
      title: 'ci: add GitHub Actions release workflow',
      body: 'Adds automated release workflow with tag-triggered deploys.',
      author: 'bob',
      mergedAt: daysAgo(27),
      releaseId: v180Id,
      featureId: 'seed-feat-purco-infra',
      commits: [
        { sha: 'abc4001', message: 'ci: add release.yml workflow', author: 'bob', committedAt: daysAgo(28) },
        { sha: 'abc4002', message: 'ci: fix environment secret names', author: 'bob', committedAt: daysAgo(27) },
      ],
    },
    {
      id: 'seed-pr-5',
      number: 105,
      title: 'test: add auth integration tests',
      body: 'Adds integration tests for login-code generation, consumption, and expiry.',
      author: 'carol',
      mergedAt: daysAgo(26),
      releaseId: v180Id,
      featureId: null,
      commits: [
        { sha: 'abc5001', message: 'test: add login code happy path test', author: 'carol', committedAt: daysAgo(27) },
        { sha: 'abc5002', message: 'test: add expired code rejection test', author: 'carol', committedAt: daysAgo(26) },
      ],
    },
    {
      id: 'seed-pr-6',
      number: 106,
      title: 'fix: race condition in token revocation',
      body: 'Fixes a race condition when two refresh requests arrive simultaneously.',
      author: 'alice',
      mergedAt: daysAgo(14),
      releaseId: v181Id,
      featureId: 'seed-feat-purco-chore',
      commits: [
        { sha: 'abc6001', message: 'fix: use select-for-update on revocation check', author: 'alice', committedAt: daysAgo(15) },
        { sha: 'abc6002', message: 'test: add concurrent revocation regression test', author: 'alice', committedAt: daysAgo(14) },
      ],
    },
    {
      id: 'seed-pr-7',
      number: 107,
      title: 'fix: incorrect 401 on valid refresh after password change',
      body: 'Password changes now invalidate only tokens issued before the change timestamp.',
      author: 'bob',
      mergedAt: daysAgo(13),
      releaseId: v181Id,
      featureId: 'seed-feat-purco-chore',
      commits: [
        { sha: 'abc7001', message: 'fix: compare token iat against password_changed_at', author: 'bob', committedAt: daysAgo(14) },
      ],
    },
    {
      id: 'seed-pr-8',
      number: 108,
      title: 'feat: release dashboard skeleton with Nebula design',
      body: 'Implements the main release dashboard with glass-card layout, project switcher, and empty states.',
      author: 'alice',
      mergedAt: daysAgo(5),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-dashboard',
      commits: [
        { sha: 'abc8001', message: 'feat: add DashboardPage with glass card grid', author: 'alice', committedAt: daysAgo(7) },
        { sha: 'abc8002', message: 'feat: add ProjectSwitcher component', author: 'alice', committedAt: daysAgo(6) },
        { sha: 'abc8003', message: 'feat: add release status badge with Nebula tokens', author: 'alice', committedAt: daysAgo(5) },
      ],
    },
    {
      id: 'seed-pr-9',
      number: 109,
      title: 'feat: release list view with status filters',
      body: 'Adds the releases list with draft/merged/deployed filter tabs and coverage indicator.',
      author: 'bob',
      mergedAt: daysAgo(4),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-dashboard',
      commits: [
        { sha: 'abc9001', message: 'feat: add ReleaseListPage', author: 'bob', committedAt: daysAgo(5) },
        { sha: 'abc9002', message: 'feat: add CoverageGauge component', author: 'bob', committedAt: daysAgo(4) },
      ],
    },
    {
      id: 'seed-pr-10',
      number: 110,
      title: 'feat: PR assignment drag-and-drop board',
      body: 'Implements feature board with drag-and-drop PR cards using @dnd-kit.',
      author: 'alice',
      mergedAt: daysAgo(3),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-pr-assign',
      commits: [
        { sha: 'abc10001', message: 'feat: add FeatureBoard with dnd-kit provider', author: 'alice', committedAt: daysAgo(4) },
        { sha: 'abc10002', message: 'feat: add PrCard with drag handle', author: 'alice', committedAt: daysAgo(3) },
        { sha: 'abc10003', message: 'feat: wire assignPrToFeature mutation on drop', author: 'alice', committedAt: daysAgo(3) },
      ],
    },
    {
      id: 'seed-pr-11',
      number: 111,
      title: 'feat: unassigned PR column and coverage gate',
      body: 'Adds the unassigned column to the board and blocks status progression at <100% coverage.',
      author: 'bob',
      mergedAt: daysAgo(2),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-pr-assign',
      commits: [
        { sha: 'abc11001', message: 'feat: add unassigned column', author: 'bob', committedAt: daysAgo(3) },
        { sha: 'abc11002', message: 'feat: add coverage gate banner', author: 'bob', committedAt: daysAgo(2) },
      ],
    },
    {
      id: 'seed-pr-12',
      number: 112,
      title: 'chore: upgrade Prisma to 7.0',
      body: 'Migrates from prisma-client-js to prisma-client generator with PrismaPg adapter.',
      author: 'alice',
      mergedAt: daysAgo(2),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-infra',
      commits: [
        { sha: 'abc12001', message: 'chore: update prisma generator config', author: 'alice', committedAt: daysAgo(3) },
        { sha: 'abc12002', message: 'chore: wire PrismaPg adapter', author: 'alice', committedAt: daysAgo(2) },
        { sha: 'abc12003', message: 'chore: update import paths to generated/client/client', author: 'alice', committedAt: daysAgo(2) },
      ],
    },
    {
      id: 'seed-pr-13',
      number: 113,
      title: 'ci: add Docker health check to compose',
      body: 'Adds postgres healthcheck to docker-compose so dependent services wait for readiness.',
      author: 'bob',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-infra',
      commits: [
        { sha: 'abc13001', message: 'ci: add healthcheck to db service', author: 'bob', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-14',
      number: 114,
      title: 'test: add E2E login flow with Playwright',
      body: 'Adds end-to-end test for magic-link login from email to authenticated dashboard.',
      author: 'carol',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: null,
      commits: [
        { sha: 'abc14001', message: 'test: add login-flow.spec.ts', author: 'carol', committedAt: daysAgo(2) },
        { sha: 'abc14002', message: 'test: fix selector for OTP input', author: 'carol', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-15',
      number: 115,
      title: 'test: board drag-drop integration tests',
      body: 'Vitest integration tests for PR assignment and coverage calculation.',
      author: 'carol',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: null,
      commits: [
        { sha: 'abc15001', message: 'test: add assignPrToFeature handler test', author: 'carol', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-16',
      number: 116,
      title: 'feat: i18n setup with en/es namespaces',
      body: 'Adds react-i18next with en/es translation files for common, dashboard, and auth namespaces.',
      author: 'alice',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-dashboard',
      commits: [
        { sha: 'abc16001', message: 'feat: add i18n provider and language detector', author: 'alice', committedAt: daysAgo(2) },
        { sha: 'abc16002', message: 'feat: add en/es common and dashboard translations', author: 'alice', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-17',
      number: 117,
      title: 'feat: GraphQL code-first schema for Project and Release',
      body: 'Adds @ObjectType and @InputType for Project, Release, and resolver signatures.',
      author: 'bob',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-dashboard',
      commits: [
        { sha: 'abc17001', message: 'feat: add Project ObjectType and resolver stub', author: 'bob', committedAt: daysAgo(2) },
        { sha: 'abc17002', message: 'feat: add Release ObjectType and resolver stub', author: 'bob', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-18',
      number: 118,
      title: 'chore: add prisma-kysely generator for type-safe queries',
      body: 'Wires prisma-kysely to generate DB type and configures DummyDriver pattern.',
      author: 'alice',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-infra',
      commits: [
        { sha: 'abc18001', message: 'chore: add prisma-kysely generator', author: 'alice', committedAt: daysAgo(1) },
        { sha: 'abc18002', message: 'chore: add kysely.ts with DummyDriver', author: 'alice', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-19',
      number: 119,
      title: 'docs: update CLAUDE.md with AI env-switch and domain conventions',
      body: 'Documents the IAiProvider abstraction, env switching, and GraphQL codegen workflow.',
      author: 'bob',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-chore',
      commits: [
        { sha: 'abc19001', message: 'docs: add AI provider section to CLAUDE.md', author: 'bob', committedAt: daysAgo(1) },
      ],
    },
    {
      id: 'seed-pr-20',
      number: 120,
      title: 'feat: CASL project-scoped roles and membership guards',
      body: 'Extends @release-hub/shared with PROJECT, RELEASE, FEATURE, MEMBERSHIP, INVITATION subjects.',
      author: 'alice',
      mergedAt: daysAgo(1),
      releaseId: v190Id,
      featureId: 'seed-feat-purco-dashboard',
      commits: [
        { sha: 'abc20001', message: 'feat: add project-scoped CASL subjects', author: 'alice', committedAt: daysAgo(2) },
        { sha: 'abc20002', message: 'feat: add project role conditions to ability builder', author: 'alice', committedAt: daysAgo(1) },
      ],
    },
  ]

  for (const pr of prs) {
    await seedPullRequest(pr)
  }
}

async function main() {
  const { admin, alice, bob, carol } = await seedUsers()
  console.log('Seeded users')

  const { purco } = await seedProjects(admin.id, alice.id, bob.id, carol.id)
  console.log('Seeded projects and memberships')

  const defaultFeatures = await seedDefaultFeatures(purco.id, 'purco')
  const productFeatures = await seedProductFeatures(purco.id, 'purco')
  console.log('Seeded features')

  const { v180, v181, v190 } = await seedPurcoReleases(purco.id, defaultFeatures, productFeatures)
  console.log('Seeded releases and feature-in-release ledger')

  await seedPullRequests(v180.id, v181.id, v190.id)
  console.log('Seeded pull requests and commits')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
