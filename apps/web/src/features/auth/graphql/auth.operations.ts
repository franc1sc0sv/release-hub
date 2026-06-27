import { graphql } from '@/generated/gql'

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
    }
  }
`)

export const REFRESH_TOKEN_MUTATION = graphql(`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`)

export const ME_QUERY = graphql(`
  query Me {
    me {
      id
      email
      name
      role
      avatarUrl
    }
  }
`)

export const REQUEST_LOGIN_CODE_MUTATION = graphql(`
  mutation RequestLoginCode($input: RequestLoginCodeInput!) {
    requestLoginCode(input: $input)
  }
`)

export const LOGIN_WITH_CODE_MUTATION = graphql(`
  mutation LoginWithCode($input: LoginWithCodeInput!) {
    loginWithCode(input: $input) {
      accessToken
      refreshToken
    }
  }
`)
