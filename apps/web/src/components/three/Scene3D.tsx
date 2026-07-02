import { Suspense, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { SceneCanvas } from '@/components/three/SceneCanvas'
import { PosterFallback } from '@/components/three/PosterFallback'
import { ErrorBoundary } from '@/components/three/ErrorBoundary'
import { useNearViewport } from '@/components/three/use-near-viewport'
import { sceneRegistry, SceneKeyValue, type SceneKey, type ScenePropsMap } from '@/components/three/scenes/registry'

type PublicSceneUnion = {
  [K in SceneKey]: Record<string, never> extends ScenePropsMap[K]
    ? { scene: K; sceneProps?: ScenePropsMap[K] }
    : { scene: K; sceneProps: ScenePropsMap[K] }
}[SceneKey]

type Scene3DProps = PublicSceneUnion & {
  className?: string
  poster?: ReactNode
  ariaLabel?: string
}

function SceneRenderer(props: PublicSceneUnion) {
  switch (props.scene) {
    case SceneKeyValue.RELEASE_CAPSULE: {
      const Component = sceneRegistry[props.scene]
      return <Component {...props.sceneProps} />
    }
    case SceneKeyValue.FLAG_BEACON: {
      const Component = sceneRegistry[props.scene]
      return <Component {...props.sceneProps} />
    }
    case SceneKeyValue.FEATURE_CONSTELLATION: {
      const Component = sceneRegistry[props.scene]
      return <Component {...props.sceneProps} />
    }
    case SceneKeyValue.BRANCH_CONSTELLATION: {
      const Component = sceneRegistry[props.scene]
      return <Component {...props.sceneProps} />
    }
  }
}

export function Scene3D({ className, poster, ariaLabel, ...sceneUnion }: Scene3DProps) {
  const { t } = useTranslation('common')
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const isNearViewport = useNearViewport(containerRef)
  const resolvedAriaLabel = ariaLabel ?? t('three.decorativeScene')
  const posterFallback = poster ?? <PosterFallback />

  if (prefersReducedMotion) {
    return (
      <div ref={containerRef} role="img" aria-label={resolvedAriaLabel} className={cn('relative size-full', className)}>
        {posterFallback}
      </div>
    )
  }

  return (
    <div ref={containerRef} role="img" aria-label={resolvedAriaLabel} className={cn('relative size-full', className)}>
      {isNearViewport ? (
        <ErrorBoundary fallback={posterFallback}>
          <Suspense fallback={posterFallback}>
            <SceneCanvas>
              <SceneRenderer {...sceneUnion} />
            </SceneCanvas>
          </Suspense>
        </ErrorBoundary>
      ) : (
        posterFallback
      )}
    </div>
  )
}
