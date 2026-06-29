import type { FeatureKind, FeatureState } from '@/generated/graphql'

export const FeatureKindValue = {
  DEFAULT: 'DEFAULT',
  PRODUCT: 'PRODUCT',
} as const satisfies Record<FeatureKind, FeatureKind>

export const FeatureStateValue = {
  IN_PROGRESS: 'IN_PROGRESS',
  SHIPPED_FLAG_OFF: 'SHIPPED_FLAG_OFF',
  LIVE_STAGING: 'LIVE_STAGING',
  LIVE_PROD: 'LIVE_PROD',
  PARTIAL: 'PARTIAL',
  FULLY_RELEASED: 'FULLY_RELEASED',
  FLAG_CLEANUP_PENDING: 'FLAG_CLEANUP_PENDING',
  BLOCKED: 'BLOCKED',
} as const satisfies Record<FeatureState, FeatureState>

export const FEATURE_STATE_OPTIONS: FeatureState[] = [
  FeatureStateValue.IN_PROGRESS,
  FeatureStateValue.SHIPPED_FLAG_OFF,
  FeatureStateValue.LIVE_STAGING,
  FeatureStateValue.LIVE_PROD,
  FeatureStateValue.PARTIAL,
  FeatureStateValue.FULLY_RELEASED,
  FeatureStateValue.FLAG_CLEANUP_PENDING,
  FeatureStateValue.BLOCKED,
]

export const FEATURE_STATE_TEXT_CLASS = {
  IN_PROGRESS: 'text-indigo-300',
  LIVE_STAGING: 'text-amber-300',
  LIVE_PROD: 'text-emerald-300',
  FULLY_RELEASED: 'text-emerald-200',
  PARTIAL: 'text-violet-300',
  BLOCKED: 'text-rose-300',
  SHIPPED_FLAG_OFF: 'text-slate-300',
  FLAG_CLEANUP_PENDING: 'text-orange-300',
} as const satisfies Record<FeatureState, string>

export const FEATURE_STATE_BADGE_CLASS = {
  IN_PROGRESS: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  LIVE_STAGING: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  LIVE_PROD: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  FULLY_RELEASED: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  PARTIAL: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  BLOCKED: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  SHIPPED_FLAG_OFF: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  FLAG_CLEANUP_PENDING: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
} as const satisfies Record<FeatureState, string>
