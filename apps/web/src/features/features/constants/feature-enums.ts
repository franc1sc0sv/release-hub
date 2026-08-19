import type { FeatureKind, FeatureState } from '@/generated/graphql'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { StatusBadgeTone } from '@/components/nebula/StatusBadge'

export const FeatureKindValue = {
  DEFAULT: 'DEFAULT',
  PRODUCT: 'PRODUCT',
} as const satisfies Record<FeatureKind, FeatureKind>

export const FeatureStateValue = {
  IN_PROGRESS: 'IN_PROGRESS',
  SHIPPED_FLAG_OFF: 'SHIPPED_FLAG_OFF',
  READY_TO_RELEASE: 'READY_TO_RELEASE',
  PARTIAL: 'PARTIAL',
  FULLY_RELEASED: 'FULLY_RELEASED',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'COMPLETED',
} as const satisfies Record<FeatureState, FeatureState>

export const FEATURE_STATE_OPTIONS: FeatureState[] = [
  FeatureStateValue.IN_PROGRESS,
  FeatureStateValue.SHIPPED_FLAG_OFF,
  FeatureStateValue.READY_TO_RELEASE,
  FeatureStateValue.PARTIAL,
  FeatureStateValue.FULLY_RELEASED,
  FeatureStateValue.BLOCKED,
  FeatureStateValue.COMPLETED,
]

export const FEATURE_STATE_TEXT_CLASS = {
  IN_PROGRESS: 'text-indigo-300',
  READY_TO_RELEASE: 'text-amber-300',
  FULLY_RELEASED: 'text-emerald-200',
  PARTIAL: 'text-violet-300',
  BLOCKED: 'text-rose-300',
  SHIPPED_FLAG_OFF: 'text-slate-300',
  COMPLETED: 'text-emerald-300',
} as const satisfies Record<FeatureState, string>

export const FEATURE_STATE_BADGE_CLASS = {
  IN_PROGRESS: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  READY_TO_RELEASE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  FULLY_RELEASED: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  PARTIAL: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  BLOCKED: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  SHIPPED_FLAG_OFF: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  COMPLETED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
} as const satisfies Record<FeatureState, string>

export const FEATURE_STATE_BAR_CLASS = {
  IN_PROGRESS: 'bg-indigo-400',
  READY_TO_RELEASE: 'bg-amber-400',
  FULLY_RELEASED: 'bg-emerald-300',
  PARTIAL: 'bg-violet-400',
  BLOCKED: 'bg-rose-400',
  SHIPPED_FLAG_OFF: 'bg-slate-400',
  COMPLETED: 'bg-emerald-400',
} as const satisfies Record<FeatureState, string>

const FEATURE_STATE_TONE = {
  IN_PROGRESS: StatusBadgeTone.INDIGO,
  READY_TO_RELEASE: StatusBadgeTone.AMBER,
  FULLY_RELEASED: StatusBadgeTone.EMERALD_SOFT,
  PARTIAL: StatusBadgeTone.VIOLET,
  BLOCKED: StatusBadgeTone.ROSE,
  SHIPPED_FLAG_OFF: StatusBadgeTone.SLATE,
  COMPLETED: StatusBadgeTone.EMERALD,
} as const satisfies Record<FeatureState, StatusBadgeToneValue>

export function featureStateTone(state: FeatureState): StatusBadgeToneValue {
  return FEATURE_STATE_TONE[state]
}
