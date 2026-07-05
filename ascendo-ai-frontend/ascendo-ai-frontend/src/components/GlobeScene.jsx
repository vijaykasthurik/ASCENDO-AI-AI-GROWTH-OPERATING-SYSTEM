import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function Globe({ reducedMotion }) {
  const group = useRef()
  const outerGroup = useRef()

  const outerPoints = useMemo(() => {
    const pts = []
    const count = 10
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2
      const h = i % 2 === 0 ? 0.35 : -0.35
      pts.push(new THREE.Vector3(Math.cos(theta) * 2.15, h, Math.sin(theta) * 2.15))
    }
    return pts
  }, [])

  useFrame((state, delta) => {
    if (group.current && !reducedMotion) {
      group.current.rotation.y += delta * 0.08
    }
    if (outerGroup.current && !reducedMotion) {
      outerGroup.current.rotation.y -= delta * 0.12
      outerGroup.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.08
    }
  })

  return (
    <group>
      {/* Central Globe Core */}
      <group ref={group}>
        {/* Layer 1: Inner Energy Pulse (Glow Core) */}
        <mesh scale={0.9}>
          <sphereGeometry args={[1.48, 32, 32]} />
          <meshBasicMaterial color="#ff7a45" transparent opacity={0.35} />
        </mesh>
        
        {/* Layer 2: Core Solid Translucent Spherical Body */}
        <mesh>
          <sphereGeometry args={[1.48, 42, 42]} />
          <meshStandardMaterial color="#fff4eb" emissive="#F2622E" emissiveIntensity={0.65} roughness={0.1} metalness={0.9} transparent opacity={0.4} />
        </mesh>

        {/* Layer 3: Golden Neural Network Mesh */}
        <mesh scale={1.02}>
          <sphereGeometry args={[1.48, 22, 16]} />
          <meshBasicMaterial color="#F5A623" wireframe transparent opacity={0.6} />
        </mesh>

        {/* Layer 4: Moving Torus Data Streams */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.82, 0.015, 8, 160]} />
          <meshBasicMaterial color="#F2622E" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, 0.6, 0.2]}>
          <torusGeometry args={[1.94, 0.01, 8, 160]} />
          <meshBasicMaterial color="#ffcfa3" transparent opacity={0.35} />
        </mesh>

        {/* Layer 5: Crystalline Core */}
        <mesh scale={0.5} rotation={[0.4, 0.4, 0.4]}>
          <icosahedronGeometry args={[1.48, 1]} />
          <meshBasicMaterial color="#FED7AA" wireframe transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Rotating 3D Circular Framework Container */}
      <group ref={outerGroup}>
        {outerPoints.map((p, idx) => {
          const nextP = outerPoints[(idx + 1) % outerPoints.length]
          const diagonalP = outerPoints[(idx + 2) % outerPoints.length]
          const surfacePoint = p.clone().normalize().multiplyScalar(1.48) // Connects from surface of the sphere

          return (
            <group key={idx}>
              {/* Ring segment */}
              <Line points={[p, nextP]} color="#F5A623" transparent opacity={0.38} lineWidth={1.5} />
              {/* Lattice cross segment */}
              <Line points={[p, diagonalP]} color="#FED7AA" transparent opacity={0.16} lineWidth={1} />
              {/* Glowing connection lines to the central globe */}
              <Line points={[surfacePoint, p]} color="#F2622E" transparent opacity={0.6} lineWidth={1.2} />
              {/* Active framework node */}
              <mesh position={p}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshBasicMaterial color="#FED7AA" />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export default function GlobeScene({ reducedMotion = false }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.7], fov: 43 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.5} />
      <pointLight position={[3, 3, 3]} intensity={34} color="#F2622E" />
      <pointLight position={[-3, -2, 2]} intensity={18} color="#F5A623" />
      <Globe reducedMotion={reducedMotion} />
    </Canvas>
  )
}
