import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { StackingSpacing } from '../map.config'
import { useTextureDomLoader } from '../hooks/useTextureLoader'
import React from 'react'
import { useAbsoluteSize } from '../hooks/useAbsoluteSize'
import { uv2DCompute } from '../utils/uvCompute'

export type ImageLayerProps = {
  position: [number, number]
  children: React.ReactNode
  absoluteSize?: boolean
}

const DomLayerComponent = ({ position, children, absoluteSize }: ImageLayerProps) => {
  // absoluteSize
  const meshRef = useRef<THREE.Mesh>(null)
  absoluteSize && useAbsoluteSize(meshRef)

  // texture
  const { texture, shapeSize } = useTextureDomLoader(children)

  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  // shape
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(shapeSize[0], 0)
  shape.lineTo(shapeSize[0], shapeSize[1])
  shape.lineTo(0, shapeSize[1])
  shape.closePath()

  // UV
  useEffect(() => {
    texture && uv2DCompute(meshRef)
  }, [texture, position, children])

  if (!texture) return null

  return (
    <>
      <mesh
        ref={meshRef}
        position={[...position, StackingSpacing]}
      >
        <shapeGeometry args={[shape]} />
        <animated.meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={opacity}
        />
      </mesh>
    </>
  )
}

export const DomLayer = DomLayerComponent
