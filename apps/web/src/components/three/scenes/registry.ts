import { lazy } from 'react'
import type { ReleaseCapsuleSceneProps } from './ReleaseCapsuleScene'
import type { FlagBeaconSceneProps } from './FlagBeaconScene'
import type { FeatureConstellationSceneProps } from './FeatureConstellationScene'
import type { BranchConstellationSceneProps } from './BranchConstellationScene'

export const SceneKeyValue = {
  RELEASE_CAPSULE: 'releaseCapsule',
  FLAG_BEACON: 'flagBeacon',
  FEATURE_CONSTELLATION: 'featureConstellation',
  BRANCH_CONSTELLATION: 'branchConstellation',
} as const

export type SceneKey = (typeof SceneKeyValue)[keyof typeof SceneKeyValue]

export interface ScenePropsMap {
  [SceneKeyValue.RELEASE_CAPSULE]: ReleaseCapsuleSceneProps
  [SceneKeyValue.FLAG_BEACON]: FlagBeaconSceneProps
  [SceneKeyValue.FEATURE_CONSTELLATION]: FeatureConstellationSceneProps
  [SceneKeyValue.BRANCH_CONSTELLATION]: BranchConstellationSceneProps
}

export const sceneRegistry = {
  [SceneKeyValue.RELEASE_CAPSULE]: lazy(() => import('./ReleaseCapsuleScene')),
  [SceneKeyValue.FLAG_BEACON]: lazy(() => import('./FlagBeaconScene')),
  [SceneKeyValue.FEATURE_CONSTELLATION]: lazy(() => import('./FeatureConstellationScene')),
  [SceneKeyValue.BRANCH_CONSTELLATION]: lazy(() => import('./BranchConstellationScene')),
} as const
