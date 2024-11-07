import { useSpring, animated } from '@react-spring/three'
import { useTextureIMGLoader } from '../hooks/useTextureLoader'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useFrame } from '@react-three/fiber'
import { cameraHeight, StackingSpacing, scaleFactor } from '../3DMap'
import React from 'react'

export type ImageLayerProps = {
  img: string
  position: [number, number]
  width: number
  height: number
  absoluteSize?: boolean
  controlsRef?: React.MutableRefObject<OrbitControls | null>
}

const ImageLayerComponent = ({
  img,
  position,
  width,
  height,
  absoluteSize, // 如果要使用绝对尺寸，必须传入控制器
  controlsRef,
}: ImageLayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // 加载材质
  const texture = useTextureIMGLoader(img)

  // 过渡动画：仅当纹理加载完成时透明度变为1，否则保持为0
  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  // 创建矩形形状
  const shape = new THREE.Shape()
  shape.moveTo(0, height * scaleFactor) // 左上
  shape.lineTo(width * scaleFactor, height * scaleFactor) // 右上
  shape.lineTo(width * scaleFactor, 0) // 右下
  shape.lineTo(0, 0) // 左下
  shape.closePath()

  // 设置UV与居中
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
      geometry.center() // 可选：居中几何体
    }
  }, [img, width, height, texture])

  // 绝对大小下设置动态缩放
  useFrame(() => {
    if (absoluteSize && meshRef.current && controlsRef?.current) {
      // 获取相机与目标之间的距离
      const cameraDistance = controlsRef.current.object.position.distanceTo(
        controlsRef.current.target
      )
      // 缩放比率
      let scaleFactor = cameraDistance / cameraHeight
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }
  })

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

export const ImageLayer = React.memo(ImageLayerComponent)
