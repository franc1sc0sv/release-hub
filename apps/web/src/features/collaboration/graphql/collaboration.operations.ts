import { graphql } from '@/generated/gql'

export const LIST_MEMBERS = graphql(`
  query ListMembers($organizationId: ID!) {
    listMembers(organizationId: $organizationId) {
      id
      userId
      organizationId
      role
      name
      email
      avatarUrl
      createdAt
      updatedAt
    }
  }
`)

export const LIST_INVITATIONS = graphql(`
  query ListInvitations($organizationId: ID!) {
    listInvitations(organizationId: $organizationId) {
      id
      email
      organizationId
      role
      status
      expiresAt
      invitedById
      createdAt
      updatedAt
    }
  }
`)

export const INVITE_MEMBER = graphql(`
  mutation InviteMember($input: InviteMemberInput!) {
    inviteMember(input: $input) {
      id
      email
      organizationId
      role
      status
      expiresAt
      invitedById
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_MEMBER_ROLE = graphql(`
  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {
    updateMemberRole(input: $input) {
      id
      userId
      organizationId
      role
      name
      email
      avatarUrl
      createdAt
      updatedAt
    }
  }
`)

export const REMOVE_MEMBER = graphql(`
  mutation RemoveMember($membershipId: ID!) {
    removeMember(membershipId: $membershipId)
  }
`)

export const REVOKE_INVITATION = graphql(`
  mutation RevokeInvitation($invitationId: ID!) {
    revokeInvitation(invitationId: $invitationId)
  }
`)

export const ACCEPT_INVITATION = graphql(`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token) {
      id
      userId
      organizationId
      role
      name
      email
      avatarUrl
      createdAt
      updatedAt
    }
  }
`)
