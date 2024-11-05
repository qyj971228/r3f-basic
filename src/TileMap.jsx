/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useState, useRef } from 'react'
import { OrbitControls, Shape, Line } from '@react-three/drei'
import * as THREE from 'three'
import locations from './location.json'
import IMG from './assets/map.png'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

const StackingSpacing = 0.01
const center = [111.194099, 34.297338]

const Controler = () => {
  const target = new THREE.Vector3(...center, 0)

  const controlsRef = useRef()
  const [distance, setDistance] = useState(0)

  // 每帧更新相机与目标点的距离
  useFrame(() => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object
      const target = controlsRef.current.target

      // 计算相机与目标点之间的距离
      const dist = camera.position.distanceTo(target)
      setDistance(dist) // 更新距离状态
    }
  })

  useEffect(() => {
    console.log('Current camera distance:', distance) // 输出相机与目标点的距离
  }, [distance])

  return (
    <OrbitControls
      target={target}
      ref={controlsRef}
    />
  )
}

export default function CustomObject() {
  const [geometry, setGeometry] = useState()
  const [texture, setTexture] = useState()

  useEffect(() => {
    const shape = new THREE.Shape()

    const [firstLat, firstLon] = locations[0]
    shape.moveTo(firstLat, firstLon)

    locations.forEach(([lat, lon]) => {
      shape.lineTo(lat, lon)
    })

    shape.lineTo(firstLat, firstLon)

    const extrudeSettings = {
      depth: -0.2,
      bevelEnabled: false,
    }

    const extrudedGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

    // 计算几何体的边界框
    extrudedGeometry.computeBoundingBox()

    // 计算 UV 值
    const positionAttribute = extrudedGeometry.attributes.position
    const uvArray = new Float32Array(positionAttribute.count * 2)

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)

      // 将位置映射到 UV 值（范围 [0, 1]）
      uvArray[i * 2] =
        (x - extrudedGeometry.boundingBox.min.x) /
        (extrudedGeometry.boundingBox.max.x - extrudedGeometry.boundingBox.min.x)
      uvArray[i * 2 + 1] =
        (y - extrudedGeometry.boundingBox.min.y) /
        (extrudedGeometry.boundingBox.max.y - extrudedGeometry.boundingBox.min.y)
    }

    extrudedGeometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))

    setGeometry(extrudedGeometry)
  }, [])

  // 加载纹理
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(IMG, loadedTexture => {
      // 确保纹理只显示一次
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping
      // 设置纹理位置
      loadedTexture.offset.set(0, 0)
      setTexture(loadedTexture)
    })
  }, [])

  return (
    <Canvas camera={{ position: [...center, 1] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {geometry && texture && (
        <mesh
          geometry={geometry}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <Controler />
    </Canvas>
  )
}
