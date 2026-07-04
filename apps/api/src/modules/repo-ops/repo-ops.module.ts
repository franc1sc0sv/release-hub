import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { IntegrationModule } from '../integration/integration.module'
import { GithubAuthModule } from '../github-auth/github-auth.module'
import { ReleaseModule } from '../release/release.module'
import { RepoOpsResolver } from './resolvers/repo-ops.resolver'
import { IBlockedBranchRepository } from './interfaces/blocked-branch.repository'
import { BlockedBranchRepository } from './repositories/blocked-branch.repository'
import { BlockBranchHandler } from './commands/block-branch/block-branch.handler'
import { UnblockBranchHandler } from './commands/unblock-branch/unblock-branch.handler'
import { DeleteGithubBranchesHandler } from './commands/delete-github-branches/delete-github-branches.handler'
import { ListBlockedBranchesHandler } from './queries/list-blocked-branches/list-blocked-branches.handler'
import { GetBranchCleanupCandidatesHandler } from './queries/get-branch-cleanup-candidates/get-branch-cleanup-candidates.handler'
import { BranchCleanupPageHandler } from './queries/branch-cleanup-page/branch-cleanup-page.handler'
import { GetBranchCleanupPlanHandler } from './queries/get-branch-cleanup-plan/get-branch-cleanup-plan.handler'
import { GetBranchAuthorsHandler } from './queries/get-branch-authors/get-branch-authors.handler'

@Module({
  imports: [CqrsModule, ProjectModule, IntegrationModule, GithubAuthModule, ReleaseModule],
  providers: [
    RepoOpsResolver,
    { provide: IBlockedBranchRepository, useClass: BlockedBranchRepository },
    BlockBranchHandler,
    UnblockBranchHandler,
    DeleteGithubBranchesHandler,
    ListBlockedBranchesHandler,
    GetBranchCleanupCandidatesHandler,
    BranchCleanupPageHandler,
    GetBranchCleanupPlanHandler,
    GetBranchAuthorsHandler,
  ],
})
export class RepoOpsModule {}
