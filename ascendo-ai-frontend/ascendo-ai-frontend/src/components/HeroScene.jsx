import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Line, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

const nodes = [
  { position: [-2.05, .72, .2], color: '#F5A623' },
  { position: [2, .92, -.2], color: '#F2622E' },
  { position: [-1.65, -1.35, .35], color: '#F2622E' },
  { position: [1.82, -1.12, .1], color: '#F5A623' },
  { position: [.1, 2.05, -.45], color: '#FCD9B8' },
]

function AgentNetwork({ reducedMotion }) {
  const network = useRef()
  const core = useRef()
  const shell = useRef()
  const { pointer } = useThree()

  useFrame((_, delta) => {
    if (!network.current || reducedMotion) return
    network.current.rotation.y += delta * .09
    network.current.rotation.x = THREE.MathUtils.lerp(network.current.rotation.x, pointer.y * .1, .035)
    network.current.rotation.z = THREE.MathUtils.lerp(network.current.rotation.z, -pointer.x * .07, .035)
    if (core.current) core.current.rotation.y -= delta * .18
    if (shell.current) shell.current.rotation.x += delta * .055
  })

  return (
    <group ref={network}>
      <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={.25} floatIntensity={.45}>
        <mesh ref={core} scale={.78}>
          <icosahedronGeometry args={[1.18, 4]} />
          <MeshDistortMaterial
            color="#F5A623"
            emissive="#F2622E"
            emissiveIntensity={1.4}
            roughness={.2}
            metalness={.18}
            distort={reducedMotion ? 0 : .16}
            speed={1.5}
          />
        </mesh>
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.35, 2]} />
          <meshBasicMaterial color="#FCD9B8" transparent opacity={.72} wireframe />
        </mesh>
        <mesh scale={1.46}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshBasicMaterial color="#F2622E" transparent opacity={.12} wireframe />
        </mesh>
        <mesh scale={1.05}>
          <sphereGeometry args={[1.65, 32, 32]} />
          <meshBasicMaterial color="#F2622E" transparent opacity={.05} side={THREE.BackSide} />
        </mesh>
      </Float>

      {[0, 1, 2].map((ring) => (
        <mesh key={ring} rotation={[Math.PI / (2.9 + ring), ring * .85, ring * .25]}>
          <torusGeometry args={[2.1 + ring * .2, .007, 8, 140]} />
          <meshBasicMaterial color={ring === 1 ? '#F5A623' : '#F2622E'} transparent opacity={.22} />
        </mesh>
      ))}

      {nodes.map(({ position, color }, index) => (
        <group key={color + index}>
          <Line points={[[0, 0, 0], position]} color={color} transparent opacity={.28} lineWidth={.65} />
          <Float speed={reducedMotion ? 0 : 1.2 + index * .12} floatIntensity={.38}>
            <mesh position={position}>
              <sphereGeometry args={[.13, 24, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
            </mesh>
            <mesh position={position} scale={2.1}>
              <sphereGeometry args={[.13, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={.12} />
            </mesh>
          </Float>
        </group>
      ))}
      <Sparkles count={reducedMotion ? 22 : 70} scale={7.5} size={1.7} speed={reducedMotion ? 0 : .22} color="#FCD9B8" opacity={.6} />
    </group>
  )
}

export default function HeroScene({ reducedMotion = false }) {
  return (
    <Canvas camera={{ position: [0, 0, 6.8], fov: 43 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={.8} />
      <pointLight position={[3, 4, 4]} intensity={42} color="#F2622E" distance={10} />
      <pointLight position={[-4, -2, 2]} intensity={24} color="#F5A623" distance={9} />
      <AgentNetwork reducedMotion={reducedMotion} />
    </Canvas>
  )
}
