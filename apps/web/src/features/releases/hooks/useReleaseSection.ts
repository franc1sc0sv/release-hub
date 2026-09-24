import { useSearchParams } from 'react-router-dom'
import {
  CONFIRMED_RELEASE_SECTIONS,
  DRAFT_RELEASE_SECTIONS,
  RELEASE_SECTION_QUERY_PARAM,
} from '../constants/release-sections'
import type { ReleaseSection } from '../constants/release-sections'

export function useReleaseSection(isDraft: boolean) {
  const [searchParams, setSearchParams] = useSearchParams()
  const available = isDraft ? DRAFT_RELEASE_SECTIONS : CONFIRMED_RELEASE_SECTIONS
  const requested = searchParams.get(RELEASE_SECTION_QUERY_PARAM)
  const section = available.find((entry) => entry === requested) ?? available[0]

  function selectSection(next: ReleaseSection) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        params.set(RELEASE_SECTION_QUERY_PARAM, next)
        return params
      },
      { replace: true },
    )
  }

  return { section, available, selectSection }
}
