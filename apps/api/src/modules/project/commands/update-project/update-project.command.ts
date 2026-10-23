import type { BranchUpdateMethod } from '../../../../common/types/branch-update-method.enum'

export class UpdateProjectCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly name: string | undefined,
    readonly repo: string | undefined,
    readonly flagReminderIntervalDays: number | undefined,
    readonly conflictEnvironments: string[] | undefined,
    readonly defaultParentBranch: string | null | undefined,
    readonly branchUpdateMethod: BranchUpdateMethod | undefined,
  ) {}
}
