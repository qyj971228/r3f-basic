import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useFrame } from '@react-three/fiber'
import { cameraHeight, StackingSpacing } from '../3DMap'
import { useTextureDomLoader } from '../hooks/useTextureLoader'
import React from 'react'

export type ImageLayerProps = {
  position: [number, number]
  children: React.ReactNode
  absoluteSize?: boolean
  controlsRef?: React.MutableRefObject<OrbitControls | null>
}

const DomLayerComponent = ({ position, children, absoluteSize, controlsRef }: ImageLayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // 加载材质
  const { texture, shapeSize } = useTextureDomLoader(children)

  // 过渡动画
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

  // 更新 UV
  useEffect(() => {
    if (meshRef.current && texture) {
      const geometry = meshRef.current.geometry
      const boundingBox = new THREE.Box3().setFromObject(meshRef.current) // 获取几何体的包围盒

      // 如果包围盒有效，则继续计算 UV
      if (boundingBox.isEmpty()) {
        return // 如果包围盒为空，直接跳过
      }

      const uvs = geometry.attributes.uv.array
      const width = boundingBox.max.x - boundingBox.min.x // 计算宽度
      const height = boundingBox.max.y - boundingBox.min.y // 计算高度

      for (let i = 0; i < uvs.length; i += 2) {
        const x = uvs[i]
        const y = uvs[i + 1]

        // 使用包围盒的尺寸将 UV 映射到 [0, 1] 范围
        uvs[i] = x / width
        uvs[i + 1] = y / height
      }

      geometry.attributes.uv.needsUpdate = true // 标记 UV 更新
      geometry.center()
    }
  }, [texture, position, children])

  useFrame(() => {
    if (absoluteSize && meshRef.current && controlsRef?.current) {
      const cameraDistance = controlsRef.current.object.position.distanceTo(
        controlsRef.current.target
      )
      let scaleFactor = cameraDistance / cameraHeight
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }
  })

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
