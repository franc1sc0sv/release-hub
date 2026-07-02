import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Instance, Instances, Line } from '@react-three/drei'
import { MathUtils, Vector3, type Group } from 'three'
import { usePointerParallax } from '@/components/three/SceneCanvas'

export interface FeatureConstellationSceneProps {
  featureCount?: number
}

const NODE_COUNT = 16
const SPARK_INDEX = 5
const SPHERE_RADIUS = 1.9
const MAX_EDGE_DISTANCE = 1.35
const MAX_EDGES_PER_NODE = 2

const INDIGO_PALETTE = ['#6366f1', '#2a2483', '#8b5cf6'] as const
const MAGENTA_ACCENT = '#ec1e8c'

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function createNodePositions(): Vector3[] {
  const positions: Vector3[] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let index = 0; index < NODE_COUNT; index += 1) {
    const jitter = 0.85 + seededRandom(index * 7.31) * 0.3
    const y = 1 - (index / (NODE_COUNT - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * index

    positions.push(
      new Vector3(
        Math.cos(theta) * radiusAtY * SPHERE_RADIUS * jitter,
        y * SPHERE_RADIUS * jitter,
        Math.sin(theta) * radiusAtY * SPHERE_RADIUS * jitter,
      ),
    )
  }

  return positions
}

function createEdges(positions: Vector3[]): [Vector3, Vector3][] {
  const edges: [Vector3, Vector3][] = []
  const edgeKeys = new Set<string>()

  positions.forEach((origin, originIndex) => {
    const distances = positions
      .map((candidate, candidateIndex) => ({
        candidateIndex,
        distance: origin.distanceTo(candidate),
      }))
      .filter((entry) => entry.candidateIndex !== originIndex)
      .sort((a, b) => a.distance - b.distance)

    let connected = 0
    for (const entry of distances) {
      if (connected >= MAX_EDGES_PER_NODE) break
      if (entry.distance > MAX_EDGE_DISTANCE) break

      const key = [originIndex, entry.candidateIndex].sort((a, b) => a - b).join('-')
      if (edgeKeys.has(key)) continue

      edgeKeys.add(key)
      edges.push([origin, positions[entry.candidateIndex]])
      connected += 1
    }
  })

  return edges
}

const NODE_POSITIONS = createNodePositions()
const EDGES = createEdges(NODE_POSITIONS)

function ConstellationNodes() {
  const nodes = useMemo(
    () =>
      NODE_POSITIONS.map((position, index) => ({
        position,
        color: index === SPARK_INDEX ? MAGENTA_ACCENT : INDIGO_PALETTE[index % INDIGO_PALETTE.length],
        scale: index === SPARK_INDEX ? 0.16 : 0.11 + seededRandom(index * 3.17) * 0.05,
      })),
    [],
  )

  return (
    <Instances limit={NODE_COUNT}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.2} metalness={0.5} envMapIntensity={1.1} />
      {nodes.map((node, index) => (
        <Instance key={index} position={node.position} scale={node.scale} color={node.color} />
      ))}
    </Instances>
  )
}

function ConstellationEdges() {
  return (
    <>
      {EDGES.map(([start, end], index) => (
        <Line
          key={index}
          points={[start, end]}
          color="#6366f1"
          lineWidth={0.6}
          transparent
          opacity={0.22}
        />
      ))}
    </>
  )
}

function DriftingConstellation() {
  const driftRef = useRef<Group>(null)

  useFrame((_state, delta) => {
    const group = driftRef.current
    if (!group) return
    group.rotation.y = MathUtils.damp(group.rotation.y, group.rotation.y + delta * 0.045, 8, delta)
  })

  return (
    <group ref={driftRef}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.6}>
        <ConstellationEdges />
        <ConstellationNodes />
      </Float>
    </group>
  )
}

export default function FeatureConstellationScene(_props: FeatureConstellationSceneProps) {
  const parallaxRef = usePointerParallax<Group>()

  return (
    <group ref={parallaxRef}>
      <DriftingConstellation />
    </group>
  )
}
