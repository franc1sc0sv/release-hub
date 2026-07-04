import type { BranchCleanupSortField, SortDirection } from '@/generated/graphql'

export const BranchCleanupSortFieldValue = {
  LAST_ACTIVITY: 'LAST_ACTIVITY',
  AUTHOR: 'AUTHOR',
  PROTECTED: 'PROTECTED',
  MERGED_VIA_PR: 'MERGED_VIA_PR',
  OPEN_PR: 'OPEN_PR',
  UNREFERENCED: 'UNREFERENCED',
} as const satisfies Record<BranchCleanupSortField, BranchCleanupSortField>

export const SortDirectionValue = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const satisfies Record<SortDirection, SortDirection>

export interface IBranchSort {
  field: BranchCleanupSortField
  direction: SortDirection
}

export const SIGNAL_SORT_FIELDS: readonly BranchCleanupSortField[] = [
  BranchCleanupSortFieldValue.MERGED_VIA_PR,
  BranchCleanupSortFieldValue.OPEN_PR,
  BranchCleanupSortFieldValue.UNREFERENCED,
]
