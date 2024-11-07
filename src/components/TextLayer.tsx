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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { cameraHeight, StackingSpacing, scaleFactor } from '../3DMap'
import React from 'react'

// 导入标签
extend({ TextGeometry })

type TextLayerProps = {
  position: [number, number]
  config: {
    size: number
    color: string
    font?: string
  }
  children: React.ReactNode // 添加children，允许直接渲染文本内容
  absoluteSize?: boolean // 如果要使用绝对尺寸，必须传入控制器
  controlsRef?: React.MutableRefObject<OrbitControls | null>
}

const TextLayerComponent = (props: TextLayerProps) => {
  const {
    position,
    config: { size: propsSize, color: propsColor, font: propsFont },
    children,
    absoluteSize,
    controlsRef,
  } = props

  const meshRef = useRef<THREE.Mesh>(null)

  const font = useFontLoader(propsFont)

  const text = typeof children === 'string' ? children : 'React.ReactNode'

  const textConfig = {
    font: font as Font, // 使用加载的字体
    size: propsSize * scaleFactor * 0.8, // 调整字体大小
    depth: 0, // 字体深度
    curveSegments: 12, // 曲线段数
  }

  const textGeometryRef = useRef<TextGeometry>(null)

  const { opacity } = useSpring({
    opacity: font ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  useFrame(() => {
    if (absoluteSize && meshRef.current && controlsRef?.current) {
      // 获取相机与目标之间的距离
      const cameraDistance = controlsRef.current.object.position.distanceTo(
        controlsRef.current.target
      )
      const cameraDistanceDefault = cameraHeight // 默认相机高度
      let scaleFactor = cameraDistance / cameraDistanceDefault
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }
    // 设置文本位置
    if (meshRef.current) {
      // 因为此时scale调整了所以文字的位置错误，需要手动修正
      // 如果需要调整位置来保持视觉上的居中，计算位置调整
      // 创建一个Box3实例来获取mesh的包围盒
      const box = new THREE.Box3().setFromObject(meshRef.current)
      // 获取包围盒的尺寸
      const size = box.getSize(new THREE.Vector3())
      meshRef.current.position.set(
        position[0] - size.x / 2,
        position[1] - size.y / 2,
        2 * StackingSpacing
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
      <textGeometry
        ref={textGeometryRef}
        args={[text, textConfig]}
      />
      <animated.meshStandardMaterial
        color={propsColor}
        side={THREE.DoubleSide}
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  )
}

export const TextLayer = React.memo(TextLayerComponent)
