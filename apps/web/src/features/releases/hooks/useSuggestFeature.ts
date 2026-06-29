import { useCallback, useState } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { SUGGEST_FEATURE_FOR_PR } from '../graphql/releases.queries'

type SuggestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; featureId: string; confidence: number; rationale: string }
  | { status: 'error' }

interface UseSuggestFeatureResult {
  state: SuggestState
  suggest: (prId: string) => void
  reset: () => void
}

export function useSuggestFeature(): UseSuggestFeatureResult {
  const [state, setState] = useState<SuggestState>({ status: 'idle' })

  const [runQuery] = useLazyQuery(SUGGEST_FEATURE_FOR_PR, {
    fetchPolicy: 'network-only',
  })

  const suggest = useCallback(
    (prId: string) => {
      setState({ status: 'loading' })
      runQuery({ variables: { prId } })
        .then(({ data, error }) => {
          if (error || !data) {
            setState({ status: 'error' })
            return
          }
          const { featureId, confidence, rationale } = data.suggestFeatureForPr
          setState({ status: 'done', featureId, confidence, rationale })
        })
        .catch(() => {
          setState({ status: 'error' })
        })
    },
    [runQuery],
  )

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return { state, suggest, reset }
}
