import { FlagSortField } from '../../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../../common/types/sort-direction.enum'
import { FlagDeploymentStatus } from '../../../../common/types/flag-deployment-status.enum'
import { FlagActivityFilter } from '../../../../common/types/flag-activity-filter.enum'

export class GetFlagsQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly search: string | undefined,
    public readonly sortField: FlagSortField,
    public readonly sortEnvironment: string | undefined,
    public readonly sortDirection: SortDirection,
    public readonly statuses: FlagDeploymentStatus[] | undefined,
    public readonly activity: FlagActivityFilter | undefined,
    public readonly limit: number | undefined,
    public readonly offset: number,
  ) {}
}
