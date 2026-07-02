import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import { Euler, MathUtils, Vector3, type Group, type Mesh } from 'three'
import { usePointerParallax } from '@/components/three/SceneCanvas'

export interface BranchConstellationSceneProps {
  aliveCount?: number
  staleCount?: number
}

const MIN_BRANCH_COUNT = 0
const MAX_BRANCH_COUNT = 24
const DEFAULT_ALIVE_COUNT = 8
const DEFAULT_STALE_COUNT = 4

const ALIVE_COLOR = '#6366f1'
const STALE_COLOR = '#8b93b8'
const SPARK_COLOR = '#ec1e8c'

const ALIVE_RADIUS_RANGE: [number, number] = [1.05, 1.35]
const STALE_RADIUS_RANGE: [number, number] = [1.7, 2.15]
const ALIVE_SPEED_RANGE: [number, number] = [0.32, 0.5]
const STALE_SPEED_RANGE: [number, number] = [0.08, 0.16]

function clampBranchCount(value: number): number {
  return Math.round(MathUtils.clamp(value, MIN_BRANCH_COUNT, MAX_BRANCH_COUNT))
}

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

interface BranchNodeConfig {
  color: string
  radius: number
  tiltX: number
  tiltZ: number
  speed: number
  offset: number
  emissiveIntensity: number
  nodeScale: number
  isSpark: boolean
}

function createNodeConfigs(count: number, seedOffset: number, isStale: boolean): BranchNodeConfig[] {
  const [minRadius, maxRadius] = isStale ? STALE_RADIUS_RANGE : ALIVE_RADIUS_RANGE
  const [minSpeed, maxSpeed] = isStale ? STALE_SPEED_RANGE : ALIVE_SPEED_RANGE

  return Array.from({ length: count }, (_, index) => {
    const seed = seedOffset + index
    return {
      color: isStale ? STALE_COLOR : ALIVE_COLOR,
      radius: MathUtils.lerp(minRadius, maxRadius, seededRandom(seed * 3.11)),
      tiltX: MathUtils.degToRad(MathUtils.lerp(-32, 32, seededRandom(seed * 5.73))),
      tiltZ: MathUtils.degToRad(MathUtils.lerp(-32, 32, seededRandom(seed * 7.29))),
      speed: MathUtils.lerp(minSpeed, maxSpeed, seededRandom(seed * 9.17)),
      offset: seededRandom(seed * 1.47) * Math.PI * 2,
      emissiveIntensity: isStale ? 0.55 : 1.5,
      nodeScale: isStale ? 0.075 : 0.095,
      isSpark: false,
    }
  })
}

interface BranchOrbitProps {
  config: BranchNodeConfig
}

function BranchOrbitRing({ config }: BranchOrbitProps) {
  return (
    <mesh rotation={[config.tiltX, 0, config.tiltZ]}>
      <torusGeometry args={[config.radius, 0.006, 8, 96]} />
      <meshBasicMaterial color={config.color} transparent opacity={config.isSpark ? 0.28 : 0.14} />
    </mesh>
  )
}

function BranchOrbitNode({ config }: BranchOrbitProps) {
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

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[config.nodeScale, 20, 20]} />
      <meshStandardMaterial
        color={config.color}
        emissive={config.color}
        emissiveIntensity={config.emissiveIntensity}
        roughness={config.isSpark ? 0.15 : 0.35}
        toneMapped={false}
      />
    </mesh>
  )
}

function GlassyCore() {
  return (
    <mesh>
      <icosahedronGeometry args={[0.62, 1]} />
      <MeshTransmissionMaterial
        thickness={1.1}
        roughness={0.08}
        transmission={1}
        ior={1.35}
        chromaticAberration={0.025}
        color="#e8e8ff"
        attenuationColor="#6366f1"
        attenuationDistance={1.1}
        envMapIntensity={1.15}
      />
    </mesh>
  )
}

export default function BranchConstellationScene({
  aliveCount = DEFAULT_ALIVE_COUNT,
  staleCount = DEFAULT_STALE_COUNT,
}: BranchConstellationSceneProps) {
  const groupRef = usePointerParallax<Group>()

  const aliveNodes = useMemo(
    () => createNodeConfigs(clampBranchCount(aliveCount), 0, false),
    [aliveCount],
  )
  const staleNodes = useMemo(
    () => createNodeConfigs(clampBranchCount(staleCount), 1000, true),
    [staleCount],
  )

  const sparkNode = useMemo<BranchNodeConfig>(
    () => ({
      color: SPARK_COLOR,
      radius: 1.5,
      tiltX: MathUtils.degToRad(14),
      tiltZ: MathUtils.degToRad(-22),
      speed: 0.4,
      offset: Math.PI * 0.4,
      emissiveIntensity: 2.4,
      nodeScale: 0.1,
      isSpark: true,
    }),
    [],
  )

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.85}>
        <GlassyCore />
      </Float>
      {aliveNodes.map((config, index) => (
        <group key={`alive-${index}`}>
          <BranchOrbitRing config={config} />
          <BranchOrbitNode config={config} />
        </group>
      ))}
      {staleNodes.map((config, index) => (
        <group key={`stale-${index}`}>
          <BranchOrbitRing config={config} />
          <BranchOrbitNode config={config} />
        </group>
      ))}
      <group>
        <BranchOrbitRing config={sparkNode} />
        <BranchOrbitNode config={sparkNode} />
      </group>
    </group>
  )
}
