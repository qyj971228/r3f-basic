import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useFrame } from '@react-three/fiber'
import html2canvas from 'html2canvas'
import { cameraHeight, StackingSpacing, scaleFactor } from '../3DMap'
import ReactDOMServer from 'react-dom/server'
import { useTextureDomLoader } from '../hooks/useTextureLoader'

export type ImageLayerProps = {
  position: [number, number]
  children: React.ReactNode
  absoluteSize?: boolean
  controlsRef?: React.MutableRefObject<OrbitControls>
}

export const DomLayer = ({ position, children, absoluteSize, controlsRef }: ImageLayerProps) => {
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
      const uvs = meshRef.current.geometry.attributes.uv.array
      for (let i = 0; i < uvs.length; i += 2) {
        const x = uvs[i]
        const y = uvs[i + 1]
        uvs[i] = x / shapeSize[0]
        uvs[i + 1] = y / shapeSize[1]
      }
      meshRef.current.geometry.attributes.uv.needsUpdate = true
      meshRef.current.geometry.center()
    }
  }, [shapeSize, texture])

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
    </>
  )
}
