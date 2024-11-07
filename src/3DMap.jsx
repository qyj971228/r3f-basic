/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useState, useRef } from 'react'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import locations from './location.json'
import IMG from './assets/map.png'
import ICON from './assets/react.svg'
import { ImageLayer } from './components/ImageLayer'
import { TextLayer } from './components/TextLayer'

export const StackingSpacing = 0.001
const center = [111.194099, 34.297338]
export const cameraHeight = 1

function CustomCurve() {
  // 创建一个简单的三次贝塞尔曲线
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(111.5, 34.8, 0),
    new THREE.Vector3(111.25, 34.4, 0.2),
    new THREE.Vector3(111.25, 34.4, 0.2),
    new THREE.Vector3(111, 34, 0)
  )

  // 获取曲线上的多个点，决定曲线的分辨率
  const points = curve.getPoints(50) // 50个点来构建曲线
  const positions = points.flatMap(p => [p.x, p.y, p.z]) // 将点的坐标平铺成数组

  const lineRef = useRef()

  useFrame(() => {
    const offsetStep = 0.01
    const material = lineRef.current.material
    if (!material) {
      return
    }
    material.dashOffset -= offsetStep
    if (material.dashOffset < -1) {
      material.dashOffset = 0
    }
  })

  return (
    <Line
      ref={lineRef}
      points={positions}
      color='royalblue'
      lineWidth={10}
      dashed={true}
      dashSize={0.1}
      gapSize={0.1}
      dashOffset={0}
    />
  )
}

function CustomObject() {
  const [geometry, setGeometry] = useState()
  const [texture, setTexture] = useState()
  const target = new THREE.Vector3(...center, 0)

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

  const controlsRef = useRef()

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {/* 3D模型 */}
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

      {/* <MyText /> */}
      <TextLayer
        position={[111, 34]}
        config={{ size: 0.05, color: 'red' }}
        absoluteSize={true}
        controlsRef={controlsRef}
      >
        你好
      </TextLayer>

      {/* imageLayer */}
      <ImageLayer
        img={ICON}
        position={[111, 34]}
        width={0.12}
        height={0.1}
        absoluteSize={true}
        controlsRef={controlsRef}
      />

      {/* dashed line */}
      <mesh position={[0, 0, 0]}>
        <CustomCurve />
      </mesh>

      <OrbitControls
        target={target}
        ref={controlsRef}
      />
    </>
  )
}

function App() {
  return (
    <Canvas camera={{ position: [...center, cameraHeight] }}>
      <CustomObject />
    </Canvas>
  )
}

export default App
