import type {
  BranchActivityRange,
  BranchProtectionFilter,
  BranchSignalFilter,
} from '@/generated/graphql'

export const BranchActivityRangeValue = {
  LAST_WEEK: 'LAST_WEEK',
  LAST_MONTH: 'LAST_MONTH',
  LAST_3_MONTHS: 'LAST_3_MONTHS',
  LAST_6_MONTHS: 'LAST_6_MONTHS',
  OVER_6_MONTHS: 'OVER_6_MONTHS',
} as const satisfies Record<BranchActivityRange, BranchActivityRange>

export const BranchProtectionFilterValue = {
  PROTECTED: 'PROTECTED',
  UNPROTECTED: 'UNPROTECTED',
} as const satisfies Record<BranchProtectionFilter, BranchProtectionFilter>

export const BranchSignalFilterValue = {
  MERGED_VIA_PR: 'MERGED_VIA_PR',
  OPEN_PR: 'OPEN_PR',
  UNREFERENCED: 'UNREFERENCED',
} as const satisfies Record<BranchSignalFilter, BranchSignalFilter>

export const ACTIVITY_RANGE_OPTIONS: readonly BranchActivityRange[] = [
  BranchActivityRangeValue.LAST_WEEK,
  BranchActivityRangeValue.LAST_MONTH,
  BranchActivityRangeValue.LAST_3_MONTHS,
  BranchActivityRangeValue.LAST_6_MONTHS,
  BranchActivityRangeValue.OVER_6_MONTHS,
]

export const PROTECTION_FILTER_OPTIONS: readonly BranchProtectionFilter[] = [
  BranchProtectionFilterValue.PROTECTED,
  BranchProtectionFilterValue.UNPROTECTED,
]

export const SIGNAL_FILTER_OPTIONS: readonly BranchSignalFilter[] = [
  BranchSignalFilterValue.MERGED_VIA_PR,
  BranchSignalFilterValue.OPEN_PR,
  BranchSignalFilterValue.UNREFERENCED,
]
