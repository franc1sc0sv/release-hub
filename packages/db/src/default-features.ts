import { FeatureKind } from './generated/client/enums'

export interface IDefaultFeatureDefinition {
  name: string
  description: string
  kind: typeof FeatureKind.default
}

export const DEFAULT_FEATURES: IDefaultFeatureDefinition[] = [
  {
    name: 'Infra Changes',
    description: 'Infrastructure, DevOps, CI/CD, deployment configuration, and platform changes.',
    kind: FeatureKind.default,
  },
  {
    name: 'Integration Tests',
    description: 'Integration test additions, fixes, and improvements covering service boundaries.',
    kind: FeatureKind.default,
  },
  {
    name: 'E2E Tests',
    description: 'End-to-end test suite additions, fixes, and Playwright scenario coverage.',
    kind: FeatureKind.default,
  },
  {
    name: 'Dev/Chore',
    description: 'Dependency updates, code cleanup, refactoring, and developer experience improvements.',
    kind: FeatureKind.default,
  },
]
