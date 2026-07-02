import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { Euler, MathUtils, Vector3, type Group, type Mesh } from 'three'
import { usePointerParallax } from '@/components/three/SceneCanvas'

export interface ReleaseCapsuleSceneProps {
  releaseStatus?: string
}

interface SatelliteConfig {
  color: string
  radius: number
  tiltX: number
  tiltZ: number
  speed: number
  offset: number
  emissiveIntensity: number
  isSpark: boolean
}

const SATELLITES: SatelliteConfig[] = [
  {
    color: '#6366f1',
    radius: 2.05,
    tiltX: MathUtils.degToRad(18),
    tiltZ: MathUtils.degToRad(-12),
    speed: 0.35,
    offset: 0,
    emissiveIntensity: 1.6,
    isSpark: false,
  },
  {
    color: '#8b5cf6',
    radius: 1.7,
    tiltX: MathUtils.degToRad(-24),
    tiltZ: MathUtils.degToRad(16),
    speed: 0.46,
    offset: Math.PI * 0.66,
    emissiveIntensity: 1.4,
    isSpark: false,
  },
  {
    color: '#ec1e8c',
    radius: 1.85,
    tiltX: MathUtils.degToRad(8),
    tiltZ: MathUtils.degToRad(28),
    speed: 0.28,
    offset: Math.PI * 1.35,
    emissiveIntensity: 2.2,
    isSpark: true,
  },
]

interface OrbitRingProps {
  config: SatelliteConfig
}

function OrbitRing({ config }: OrbitRingProps) {
  return (
    <mesh rotation={[config.tiltX, 0, config.tiltZ]}>
      <torusGeometry args={[config.radius, 0.008, 8, 96]} />
      <meshBasicMaterial color={config.color} transparent opacity={0.18} />
    </mesh>
  )
}

interface OrbitSatelliteProps {
  config: SatelliteConfig
}

function OrbitSatellite({ config }: OrbitSatelliteProps) {
  const meshRef = useRef<Mesh>(null)
  const ringEuler = useMemo(() => new Euler(config.tiltX, 0, config.tiltZ), [config.tiltX, config.tiltZ])
  const orbitPosition = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const angle = clock.elapsedTime * config.speed + config.offset
    orbitPosition
      .set(Math.cos(angle) * config.radius, 0, Math.sin(angle) * config.radius)
      .applyEuler(ringEuler)

    mesh.position.copy(orbitPosition)
  })

  const satelliteRadius = config.isSpark ? 0.09 : 0.07

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[satelliteRadius, 24, 24]} />
      <meshStandardMaterial
        color={config.color}
        emissive={config.color}
        emissiveIntensity={config.emissiveIntensity}
        roughness={0.3}
        toneMapped={false}
      />
    </mesh>
  )
}

function CapsuleCore() {
  return (
    <mesh rotation={[0, 0, MathUtils.degToRad(90)]}>
      <capsuleGeometry args={[0.62, 1.1, 8, 32]} />
      <meshPhysicalMaterial
        color="#e8e8ff"
        roughness={0.06}
        metalness={0}
        transmission={1}
        thickness={1.4}
        ior={1.3}
        clearcoat={1}
        clearcoatRoughness={0.1}
        attenuationColor="#6366f1"
        attenuationDistance={1.2}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}

export default function ReleaseCapsuleScene(_props: ReleaseCapsuleSceneProps) {
  const groupRef = usePointerParallax<Group>()
  const satellites = useMemo(() => SATELLITES, [])

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
        <CapsuleCore />
      </Float>
      {satellites.map((config, index) => (
        <group key={index}>
          <OrbitRing config={config} />
          <OrbitSatellite config={config} />
        </group>
      ))}
    </group>
  )
}
