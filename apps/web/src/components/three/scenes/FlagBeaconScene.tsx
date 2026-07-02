import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Instance, Instances, MeshTransmissionMaterial } from '@react-three/drei'
import { MathUtils, type Group, type Mesh, type PointLight } from 'three'
import { usePointerParallax } from '@/components/three/SceneCanvas'

export interface FlagBeaconSceneProps {
  accent?: boolean
}

const MOTE_COUNT = 3
const MOTE_RISE_HEIGHT = 2.4
const MOTE_BASE_Y = -1.1

interface MoteSeed {
  angle: number
  radius: number
  speed: number
  offset: number
}

function useMoteSeeds(): MoteSeed[] {
  return useMemo(
    () =>
      Array.from({ length: MOTE_COUNT }, (_, index) => ({
        angle: (index / MOTE_COUNT) * Math.PI * 2,
        radius: 0.45 + (index % 2) * 0.15,
        speed: 0.22 + index * 0.05,
        offset: index / MOTE_COUNT,
      })),
    [],
  )
}

function LightMotes({ color }: { color: string }) {
  const seeds = useMoteSeeds()
  const refs = useRef<(Mesh | null)[]>([])

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()

    seeds.forEach((seed, index) => {
      const mesh = refs.current[index]
      if (!mesh) return

      const cycle = ((elapsed * seed.speed + seed.offset) % 1)
      const y = MOTE_BASE_Y + cycle * MOTE_RISE_HEIGHT
      const wobble = Math.sin(elapsed * 0.8 + seed.angle) * 0.08

      mesh.position.set(
        Math.cos(seed.angle + elapsed * 0.15) * seed.radius + wobble,
        y,
        Math.sin(seed.angle + elapsed * 0.15) * seed.radius,
      )

      const fadeIn = Math.min(cycle / 0.15, 1)
      const fadeOut = Math.min((1 - cycle) / 0.35, 1)
      const opacity = Math.max(Math.min(fadeIn, fadeOut), 0) * 0.85

      const material = mesh.material
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = opacity
      }
    })
  })

  return (
    <Instances limit={MOTE_COUNT} range={MOTE_COUNT}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
      {seeds.map((seed, index) => (
        <Instance
          key={seed.angle}
          ref={(mesh: Mesh | null) => {
            refs.current[index] = mesh
          }}
        />
      ))}
    </Instances>
  )
}

function PulsingCore({ color }: { color: string }) {
  const lightRef = useRef<PointLight>(null)
  const coreRef = useRef<Mesh>(null)

  useFrame((state) => {
    const pulse = 0.6 + Math.sin(state.clock.getElapsedTime() * 1.1) * 0.4
    if (lightRef.current) {
      lightRef.current.intensity = MathUtils.lerp(1.4, 3.2, pulse)
    }
    if (coreRef.current) {
      const scale = MathUtils.lerp(0.85, 1.05, pulse)
      coreRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={[0, 0.15, 0]}>
      <pointLight ref={lightRef} color={color} intensity={2} distance={4} decay={2} />
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function BeaconPylon({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, -0.35, 0]}>
        <capsuleGeometry args={[0.32, 1.5, 8, 24]} />
        <MeshTransmissionMaterial
          thickness={0.6}
          roughness={0.12}
          transmission={1}
          ior={1.35}
          chromaticAberration={0.03}
          color="#6366f1"
        />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.035, 12, 48]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </>
  )
}

export default function FlagBeaconScene({ accent = false }: FlagBeaconSceneProps) {
  const coreColor = accent ? '#ec1e8c' : '#6366f1'
  const parallaxRef = usePointerParallax<Group>()

  return (
    <group ref={parallaxRef}>
      <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.9}>
        <BeaconPylon color={coreColor} />
        <PulsingCore color={coreColor} />
        <LightMotes color={coreColor} />
      </Float>
    </group>
  )
}
