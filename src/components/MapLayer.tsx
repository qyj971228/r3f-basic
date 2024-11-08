import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTextureIMGLoader } from '../hooks/useTextureLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useFrame } from '@react-three/fiber'
import { cameraHeight } from '../3DMap'
import { animated, useSpring } from '@react-spring/three'
import { Edges } from '@react-three/drei'

export type MapLayerProps = {
  img?: string
  color?: string
  showEdge?: boolean
  positions: [number, number][]
  height: number
  absoluteSize?: boolean
  controlsRef?: React.MutableRefObject<OrbitControls | null>
}

export const MapLayer = ({
  img,
  color,
  positions,
  showEdge,
  height,
  absoluteSize,
  controlsRef,
}: MapLayerProps) => {
  const texture = img && useTextureIMGLoader(img)

  // 过渡动画：仅当纹理加载完成时透明度变为1，否则保持为0
  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 200 },
  })

  const meshRef = useRef<THREE.Mesh>(null)

  const shape = new THREE.Shape()

  const [firstLat, firstLon] = positions[0]
  shape.moveTo(firstLat, firstLon)

  positions.forEach(([lat, lon]) => {
    shape.lineTo(lat, lon)
  })

  shape.lineTo(firstLat, firstLon)

  shape.closePath()

  const extrudeSettings = {
    depth: -height,
    bevelEnabled: false,
  }

  // 计算UV
  useEffect(() => {
    if (meshRef.current && texture) {
      const geometry = meshRef.current.geometry
      // 计算几何体的边界框
      geometry.computeBoundingBox()

      // 计算 UV 值
      const positionAttribute = geometry.attributes.position
      const uvArray = new Float32Array(positionAttribute.count * 2)

      if (!geometry.boundingBox) return

      const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x
      const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y

      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)

        // 将位置映射到 UV 值（范围 [0, 1]）
        uvArray[i * 2] = (x - geometry.boundingBox.min.x) / width
        uvArray[i * 2 + 1] = (y - geometry.boundingBox.min.y) / height
      }

      geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
      geometry.attributes.uv.needsUpdate = true
    }
  }, [texture])

  useFrame(() => {
    if (absoluteSize && meshRef.current && controlsRef?.current) {
      const cameraDistance = controlsRef.current.object.position.distanceTo(
        controlsRef.current.target
      )
      let scaleFactor = cameraDistance / cameraHeight
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }
  })

  return (
    <>
      <animated.mesh
        ref={meshRef}
        position={[0, 0, 0]}
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        {texture ? (
          <animated.meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent={true}
            opacity={opacity}
          />
        ) : (
          <animated.meshStandardMaterial
            color={color ? color : 'pink'}
            opacity={0.99}
            transparent={true}
            side={THREE.DoubleSide}
          />
        )}
        {showEdge && <Edges color={'#bbb'} />}
      </animated.mesh>
    </>
  )
}
