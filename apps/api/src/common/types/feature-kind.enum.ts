import { registerEnumType } from '@nestjs/graphql'

export const FeatureKind = {
  PRODUCT: 'product',
  DEFAULT: 'default',
} as const

export type FeatureKind = (typeof FeatureKind)[keyof typeof FeatureKind]

registerEnumType(FeatureKind, { name: 'FeatureKind' })
