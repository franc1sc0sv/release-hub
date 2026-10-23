import { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'
import { BranchUpdateAction, type IBranchUpdateDecisionInput } from '../interfaces/release-branch.interfaces'

export function decideBranchUpdate(input: IBranchUpdateDecisionInput): BranchUpdateAction {
  if (input.behindBy === 0) return BranchUpdateAction.NOTHING
  if (input.method === BranchUpdateMethod.MERGE) return BranchUpdateAction.MERGE
  return input.ownCommits === 0 ? BranchUpdateAction.FAST_FORWARD : BranchUpdateAction.REFUSE
}
