import { useSpring, animated } from '@react-spring/three'
import { useTextureLoader } from '../hooks/useTextureLoader'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useFrame } from '@react-three/fiber'
import { cameraHeight, StackingSpacing } from '../3DMap'

export type ImageLayerProps = {
  img: string
  position: [number, number]
  width: number
  height: number
  absoluteSize?: boolean
  controlsRef?: React.MutableRefObject<OrbitControls>
}

export const ImageLayer = ({
  img,
  position,
  width,
  height,
  absoluteSize, // 如果要使用绝对尺寸，必须传入控制器
  controlsRef,
}: ImageLayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // 加载材质
  const texture = useTextureLoader(img)

  // 过渡动画：仅当纹理加载完成时透明度变为1，否则保持为0
  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  // 创建矩形形状
  const shape = new THREE.Shape()
  shape.moveTo(0, height) // 左上
  shape.lineTo(width, height) // 右上
  shape.lineTo(width, 0) // 右下
  shape.lineTo(0, 0) // 左下
  shape.closePath()

  // 设置UV与居中
  useEffect(() => {
    if (meshRef.current) {
      const uvs = meshRef.current.geometry.attributes.uv.array

      // UV 映射
      for (let i = 0; i < uvs.length; i += 2) {
        const x = uvs[i]
        const y = uvs[i + 1]

        uvs[i] = x / width // x 坐标的 UV 映射：从 0 到 1
        uvs[i + 1] = y / height // y 坐标的 UV 映射：从 0 到 1
      }

      // 更新 UV 坐标
      meshRef.current.geometry.attributes.uv.needsUpdate = true

      // 居中
      meshRef.current.geometry.center()
    }
  }, [width, height, position])

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

  return (
    <mesh
      ref={meshRef}
      position={[...position, 2 * StackingSpacing]}
    >
      <shapeGeometry args={[shape]} />
      <animated.meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  )
}
