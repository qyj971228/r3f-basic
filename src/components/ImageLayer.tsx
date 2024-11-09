import { useSpring, animated } from '@react-spring/three'
import { useTextureIMGLoader } from '../hooks/useTextureLoader'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { StackingSpacing, scaleFactor } from '../map.config'
import { useAbsoluteSize } from '../hooks/useAbsoluteSize'
import { uv2DCompute } from '../utils/uvCompute'

export type ImageLayerProps = {
  img: string
  position: [number, number]
  width: number
  height: number
  absoluteSize?: boolean
  dependents?: any[] // 依赖
}

const ImageLayerComponent = ({
  img,
  position,
  width,
  height,
  absoluteSize,
  dependents,
}: ImageLayerProps) => {
  // absoluteSize
  const meshRef = useRef<THREE.Mesh>(null)
  absoluteSize && useAbsoluteSize(meshRef)

  // texture
  const texture = useTextureIMGLoader(img)

  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  // shape
  const shape = new THREE.Shape()
  shape.moveTo(0, height * scaleFactor) // 左上
  shape.lineTo(width * scaleFactor, height * scaleFactor) // 右上
  shape.lineTo(width * scaleFactor, 0) // 右下
  shape.lineTo(0, 0) // 左下
  shape.closePath()

  // UV
  useEffect(() => {
    texture && uv2DCompute(meshRef)
  }, [img, width, height, texture, dependents])

  

  if (!texture) return null

  return (
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
  )
}

export const ImageLayer = ImageLayerComponent
