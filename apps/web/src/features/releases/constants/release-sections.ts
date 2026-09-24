export const ReleaseSectionValue = {
  ASSIGN: 'assign',
  FEATURES: 'features',
  PRS: 'prs',
  FLAGS: 'flags',
  CARRY_OVER: 'carry-over',
  SUMMARY: 'summary',
} as const

export type ReleaseSection = (typeof ReleaseSectionValue)[keyof typeof ReleaseSectionValue]

export const DRAFT_RELEASE_SECTIONS: ReleaseSection[] = [
  ReleaseSectionValue.ASSIGN,
  ReleaseSectionValue.FLAGS,
  ReleaseSectionValue.CARRY_OVER,
  ReleaseSectionValue.SUMMARY,
]

export const CONFIRMED_RELEASE_SECTIONS: ReleaseSection[] = [
  ReleaseSectionValue.FEATURES,
  ReleaseSectionValue.PRS,
  ReleaseSectionValue.FLAGS,
  ReleaseSectionValue.CARRY_OVER,
  ReleaseSectionValue.SUMMARY,
]

export const RELEASE_SECTION_QUERY_PARAM = 'section'
