import { FeatureKind } from './generated/client/enums'

export interface IDefaultFeatureDefinition {
  name: string
  description: string
  kind: typeof FeatureKind.default
}

export const DEFAULT_FEATURES: IDefaultFeatureDefinition[] = [
  {
    name: 'Bugs',
    description:
      'All bug fixes and defect corrections — PRs whose primary purpose is fixing broken, incorrect, or unintended behavior. Includes regressions, crashes, data/display errors, "not working" issues, incorrect handling or calculations, and anything titled [Bug]/[BUG] or describing a defect. Choose this over a product feature whenever the PR\'s main intent is fixing a bug rather than building new functionality.',
    kind: FeatureKind.default,
  },
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
