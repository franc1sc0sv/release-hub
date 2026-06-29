import { FlagSortField } from '../../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../../common/types/sort-direction.enum'

export class GetFlagsQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly search: string | undefined,
    public readonly sortField: FlagSortField,
    public readonly sortEnvironment: string | undefined,
    public readonly sortDirection: SortDirection,
    public readonly limit: number,
    public readonly offset: number,
  ) {}
}
