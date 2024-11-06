/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useState, useRef } from 'react'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import locations from './location.json'
import IMG from './assets/map.png'
import ICON from './assets/react.svg'
import FONT from './assets/font-cn.json'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { ImageLayer } from './components/ImageLayer'
import { TextLayer } from './components/TextLayer'

const StackingSpacing = 0.001
const center = [111.194099, 34.297338]

// const MyShape = () => {
//   const [texture, setTexture] = useState(null)

//   useEffect(() => {
//     // 加载贴图
//     const loader = new THREE.TextureLoader()
//     loader.load(IMG, loadedTexture => {
//       setTexture(loadedTexture)
//     })
//   }, [])

//   // 创建一个简单的矩形形状
//   const shape = new THREE.Shape()
//   shape.moveTo(110.6, 33.95)
//   shape.lineTo(110.5, 33.95)
//   shape.lineTo(110.5, 34.05)
//   shape.lineTo(110.6, 34.05)
//   shape.closePath()

//   // 将 shape 转换为 BufferGeometry
//   const geometry = new THREE.ShapeGeometry(shape)

//   // 获取所有顶点位置数组
//   const positions = geometry.attributes.position.array

//   // 计算形状的最小值和最大值
//   let minX = Infinity,
//     maxX = -Infinity,
//     minY = Infinity,
//     maxY = -Infinity

//   for (let i = 0; i < positions.length; i += 3) {
//     const x = positions[i]
//     const y = positions[i + 1]

//     minX = Math.min(minX, x)
//     maxX = Math.max(maxX, x)
//     minY = Math.min(minY, y)
//     maxY = Math.max(maxY, y)
//   }

//   // 计算形状的宽度和高度
//   const width = maxX - minX
//   const height = maxY - minY

//   // 为 UV 坐标计算公式
//   const uvs = geometry.attributes.uv.array
//   for (let i = 0; i < positions.length; i += 3) {
//     const x = positions[i]
//     const y = positions[i + 1]

//     // 动态计算 UV 映射
//     uvs[(i / 3) * 2] = (x - minX) / width // x 坐标的 UV 映射
//     uvs[(i / 3) * 2 + 1] = (y - minY) / height // y 坐标的 UV 映射
//   }

//   // 更新 UV 坐标
//   geometry.attributes.uv.needsUpdate = true

//   const material = texture ? (
//     <meshBasicMaterial
//       map={texture}
//       side={THREE.DoubleSide}
//       transparent={true}
//       opacity={1}
//     />
//   ) : (
//     <meshBasicMaterial
//       color='orange'
//       side={THREE.DoubleSide}
//     />
//   )

//   return <mesh geometry={geometry}>{material}</mesh>
// }

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

// const MyText = () => {
//   const [font, setFont] = useState(null)
//   useEffect(() => {
//     const loader = new FontLoader()
//     const loadedFont = loader.parse(FONT)
//     setFont(loadedFont)
//   }, [])

//   if (!font) {
//     return null // 等待字体加载完成
//   }

//   // 创建文本几何体
//   const textGeometry = new TextGeometry('你好', {
//     font: font, // 使用加载的字体
//     size: 0.1, // 调整字体大小
//     depth: 0, // 字体深度
//     curveSegments: 12, // 曲线段数
//   })

//   // 调整文本几何体的位置，使文本显示在中心
//   textGeometry.center()

//   // 材质
//   const material = new THREE.MeshBasicMaterial({ color: 'skyblue' })

//   return (
//     <mesh
//       position={[111, 34, 2 * StackingSpacing]}
//       geometry={textGeometry}
//       material={material}
//       onPointerMove={e => {
//         e.stopPropagation()
//         console.log('moving', e.clientX, e.clientY)
//       }}
//     >
//       {/* 可以添加其他操作 */}
//     </mesh>
//   )
// }

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
      {/* imageLayer */}
      <ImageLayer
        img={ICON}
        center={[110.55, 34]}
        width={0.12}
        height={0.1}
      />
      {/* dashed line */}
      <mesh position={[0, 0, 0]}>
        <CustomCurve />
      </mesh>

      {/* <MyText /> */}
      <TextLayer
        position={[111, 34, 2 * StackingSpacing]}
        config={{ size: 0.05, color: 'red' }}
      >
        {/* <div style={{color: 'green'}}>你好</div> */}
        你好
      </TextLayer>
      <Controler />
    </Canvas>
  )
}
