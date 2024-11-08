import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useTextureIMGLoader } from '../hooks/useTextureLoader'
import { animated, useSpring, to } from '@react-spring/three'
import { Edges } from '@react-three/drei'
import chroma from 'chroma-js'
import { useAbsoluteSize } from '../hooks/useAbsoluteSize'
import { uv3DCompute } from '../utils/uvCompute'

export type MapLayerProps = {
  img?: string
  color?: string
  showEdge?: boolean
  positions: [number, number][]
  height: number
  absoluteSize?: boolean
  dependents?: any[] // 额外依赖
}

export const MapLayer = ({
  img,
  color: propColor = 'pink',
  positions,
  showEdge,
  height,
  absoluteSize,
  dependents,
}: MapLayerProps) => {
  // absoluteSize
  const meshRef = useRef<THREE.Mesh>(null)
  absoluteSize && useAbsoluteSize(meshRef)

  // custom texture
  const texture = img && useTextureIMGLoader(img)
  
  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  // texture color
  const [hovered, setHovered] = useState(false)

  const brighterColor = chroma(propColor).brighten(0.5).hex()

  const { color } = useSpring({
    color: hovered ? brighterColor : propColor,
    config: { duration: 200 },
  })

  // extrudeGeometry args
  const extrudeSettings = {
    depth: -height,
    bevelEnabled: false,
  }

  // shape
  const shape = new THREE.Shape()

  const [firstLat, firstLon] = positions[0]

  shape.moveTo(firstLat, firstLon)
  positions.forEach(([lat, lon]) => {
    shape.lineTo(lat, lon)
  })
  shape.lineTo(firstLat, firstLon)
  shape.closePath()

  // UV
  useEffect(() => {
    texture && uv3DCompute(meshRef)
  }, [texture, dependents])

  return (
    <>
      <animated.mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onPointerEnter={e => {
          if (texture) return
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={e => {
          if (texture) return
          e.stopPropagation()
          setHovered(false)
        }}
      >
        {shape && <extrudeGeometry args={[shape, extrudeSettings]} />}
        {texture ? (
          <animated.meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent={true}
            opacity={opacity}
          />
        ) : (
          <animated.meshStandardMaterial
            color={to([color], color => color)}
            opacity={1}
            transparent={true}
            side={THREE.DoubleSide}
          />
        )}
        {showEdge && (
          <Edges
            color={'#bbb'}
            lineWidth={1}
          />
        )}
      </animated.mesh>
    </>
  )
}
