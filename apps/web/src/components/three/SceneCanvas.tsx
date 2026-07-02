import { useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { MathUtils } from 'three'

const MAX_PARALLAX_RADIANS = MathUtils.degToRad(4)
const DAMPING = 4

export function usePointerParallax<T extends Group>() {
  const ref = useRef<T>(null)
  const { pointer } = useThree()

  useFrame((_state, delta) => {
    const group = ref.current
    if (!group) return

    const targetX = -pointer.y * MAX_PARALLAX_RADIANS
    const targetY = pointer.x * MAX_PARALLAX_RADIANS

    group.rotation.x = MathUtils.damp(group.rotation.x, targetX, DAMPING, delta)
    group.rotation.y = MathUtils.damp(group.rotation.y, targetY, DAMPING, delta)
  })

  return ref
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#6366f1" />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#ec1e8c" />
      <directionalLight position={[0, -3, -4]} intensity={0.35} color="#8b5cf6" />
    </>
  )
}

interface SceneCanvasProps {
  children: ReactNode
  frameloop?: 'always' | 'demand'
}

export function SceneCanvas({ children, frameloop = 'always' }: SceneCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      shadows={false}
      camera={{ position: [0, 0, 5], fov: 45 }}
      frameloop={frameloop}
    >
      <SceneLighting />
      {children}
    </Canvas>
  )
}
