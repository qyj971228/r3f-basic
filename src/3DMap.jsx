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

const MyShape = () => {
  // 创建一个简单的矩形形状
  const shape = new THREE.Shape()
  shape.moveTo(110.6, 33.95)
  shape.lineTo(110.5, 33.95)
  shape.lineTo(110.5, 34.05)
  shape.lineTo(110.6, 34.05)
  shape.closePath()

  return (
    <Shape args={[shape]}>
      <meshBasicMaterial
        color='orange'
        side={THREE.DoubleSide}
      />
    </Shape>
  )
}

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

const MyText = () => {
  const [font, setFont] = useState(null)

  // 加载默认字体（例如helvetiker_regular.typeface.json）
  useEffect(() => {
    const loader = new FontLoader()
    loader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      loadedFont => {
        setFont(loadedFont)
      }
    )
  }, [])

  if (!font) {
    return null // 等待字体加载完成
  }

  // 创建文本几何体
  const textGeometry = new TextGeometry('Hello, World!', {
    font: font, // 使用加载的字体
    size: 0.1, // 调整字体大小
    height: 0, // 字体深度
    curveSegments: 12, // 曲线段数
  })

  // 调整文本几何体的位置，使文本显示在中心
  textGeometry.center()

  // 材质
  const material = new THREE.MeshBasicMaterial({ color: 'skyblue' })

  return (
    <mesh
      position={[111, 34, 2 * StackingSpacing]}
      geometry={textGeometry}
      material={material}
      onPointerMove={e => {
        e.stopPropagation()
        console.log('moving', e.clientX, e.clientY)
      }}
    >
      {/* 可以添加其他操作 */}
    </mesh>
  )
}

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
      {/* custom shape */}
      <mesh
        position={[0, 0, StackingSpacing]}
        onPointerMove={e => {
          e.stopPropagation()
          console.log('moving', e.clientX, e.clientY)
        }}
      >
        <MyShape />
      </mesh>
      {/* dashed line */}
      <mesh position={[0, 0, 0]}>
        <CustomCurve />
      </mesh>

      <MyText />
      <Controler />
    </Canvas>
  )
}
