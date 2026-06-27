import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../api/src/schema.gql',
  documents: 'src/**/*.{ts,tsx}',
  generates: {
    'src/generated/': {
      preset: 'client',
      config: {
        enumsAsTypes: true,
        avoidOptionals: true,
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
