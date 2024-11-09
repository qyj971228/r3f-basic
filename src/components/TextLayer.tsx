// 为 TypeScript 添加 textGeometry 的类型声明
declare global {
  namespace JSX {
    interface IntrinsicElements {
      textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>
    }
  }
}

import { useFontLoader } from '../hooks/useFontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { extend, Object3DNode, useFrame } from '@react-three/fiber'
import { Font } from 'three/examples/jsm/loaders/FontLoader'
import { useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { StackingSpacing, scaleFactor } from '../map.config'
import React from 'react'
import { useAbsoluteSize } from '../hooks/useAbsoluteSize'

// 导入标签
extend({ TextGeometry })

type TextLayerProps = {
  position: [number, number]
  config: {
    size: number
    color: string
    font?: string
  }
  children: React.ReactNode
  absoluteSize?: boolean
}

const TextLayerComponent = (props: TextLayerProps) => {
  const {
    position,
    config: { size: propsSize, color: propsColor, font: propsFont },
    children,
    absoluteSize,
  } = props

  // absoluteSize
  const meshRef = useRef<THREE.Mesh>(null)
  absoluteSize && useAbsoluteSize(meshRef)

  // font
  const font = useFontLoader(propsFont)

  const text = typeof children === 'string' ? children : 'React.ReactNode'

  const textConfig = {
    font: font as Font, // 使用加载的字体
    size: propsSize * scaleFactor * 0.8, // 调整字体大小
    depth: 0, // 字体深度
    curveSegments: 12, // 曲线段数
  }

  const { opacity } = useSpring({
    opacity: font ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  useFrame(() => {
    // 设置文本位置
    if (meshRef.current) {
      // 创建一个Box3实例来获取mesh的包围盒
      const box = new THREE.Box3().setFromObject(meshRef.current)
      // 获取包围盒的尺寸
      const size = box.getSize(new THREE.Vector3())
      meshRef.current.position.set(
        position[0] - size.x / 2,
        position[1] - size.y / 2,
        StackingSpacing
      )
    }
  })

  if (!font || !text) {
    return null
  }

  return (
    <mesh
      ref={meshRef}
      position={[...position, StackingSpacing]}
    >
      <textGeometry args={[text, textConfig]} />
      <animated.meshStandardMaterial
        color={propsColor}
        side={THREE.DoubleSide}
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  )
}

export const TextLayer = TextLayerComponent
