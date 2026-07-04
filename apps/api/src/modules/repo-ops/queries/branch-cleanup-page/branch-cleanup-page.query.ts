import type { SortDirection } from '../../../../common/types/sort-direction.enum'
import type {
  BranchActivityRange,
  BranchCleanupSortField,
  BranchProtectionFilter,
  BranchSignalFilter,
} from '../../interfaces/repo-ops.interfaces'

export class BranchCleanupPageQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly limit: number,
    readonly offset: number,
    readonly search: string | null,
    readonly sortField: BranchCleanupSortField | null,
    readonly sortDirection: SortDirection,
    readonly authorFilter: string | null,
    readonly activity: BranchActivityRange | null,
    readonly protection: BranchProtectionFilter | null,
    readonly signals: BranchSignalFilter[],
  ) {}
}
