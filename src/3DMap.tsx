import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { OrbitControls, Line, Edges } from '@react-three/drei'
import { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import ICON from './assets/react.svg'
import MAP from './assets/map.png'
import LOCATION_JSON from './assets/location.json'
import LOCATION_JSON_2 from './assets/location2.json'
import LOCATION_JSON_3 from './assets/location3.json'
import { ImageLayer } from './components/ImageLayer'
import { TextLayer } from './components/TextLayer'
import { DomLayer } from './components/DomLayer'
import { MapLayer } from './components/MapLayer'
import { Line2 } from 'three-stdlib'
import { useControls } from 'leva'

export const StackingSpacing = 0.001
export const center = [111.112608, 34.36205]
export const cameraHeight = 1.5
export const scaleFactor = (0.05 * cameraHeight) / 32

function CustomCurve() {
  // 使用 useMemo 优化曲线计算
  const points = useMemo(() => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(111.5, 34.8, 0),
      new THREE.Vector3(111.25, 34.4, 0.2),
      new THREE.Vector3(111.25, 34.4, 0.2),
      new THREE.Vector3(111, 34, 0)
    )
    return curve.getPoints(50).flatMap(p => [p.x, p.y, p.z]) // 50个点来构建曲线
  }, [])

  // 使用 Line2 类型
  const lineRef = useRef<Line2>(null)

  // 更新虚线的偏移量
  useFrame(() => {
    const offsetStep = 0.005
    const material = lineRef.current?.material
    if (material) {
      material.dashOffset -= offsetStep
      if (material.dashOffset < -1) {
        material.dashOffset = 0
      }
    }
  })

  return (
    <Line
      ref={lineRef}
      points={points}
      color='royalblue'
      lineWidth={10}
      dashed={true}
      dashSize={0.1}
      gapSize={0.1}
      dashOffset={0}
    />
  )
}

function Scene() {
  const controlsRef = useRef<OrbitControlsType>(null)

  const target = new THREE.Vector3(...center, 0)

  const { scale } = useControls({
    scale: {
      value: 1,
      min: 0.1,
      max: 1,
    },
  })

  return (
    <>
      {/* 3D模型 */}
      <group
        scale={scale}
        position={[center[0] * (1 - scale), center[1] * (1 - scale), 0]}
      >
        <MapLayer
          height={0.05}
          showEdge={true}
          positions={LOCATION_JSON as [number, number][]}
        />
        {/* <MapLayer
          img={MAP}
          height={0}
          positions={LOCATION_JSON as [number, number][]}
        /> */}
        {/* domlayer */}
        <DomLayer
          position={[111, 33.9]}
          absoluteSize={true}
          controlsRef={controlsRef}
        >
          <div
            style={{
              display: 'flex',
              color: 'black',
              fontSize: '12px',
              fontWeight: 'bolder',
              margin: '5px',
            }}
          >
            <img
              src={ICON}
              style={{ height: '20px', width: '22px' }}
            ></img>
            <div>这是一个打点</div>
          </div>
        </DomLayer>
      </group>
      <group
        scale={scale}
        position={[112.038509 * (1 - scale), 34.293198 * (1 - scale), 0]}
      >
        <MapLayer
          color='skyblue'
          height={0.05}
          showEdge={true}
          positions={LOCATION_JSON_2 as [number, number][]}
        />
      </group>
      <group
        scale={scale}
        position={[112.288385 * (1 - scale), 33.044723 * (1 - scale), 0]}
      >
        <MapLayer
          color='#ffff99'
          height={0.05}
          showEdge={true}
          positions={LOCATION_JSON_3 as [number, number][]}
        />
      </group>
      {/* textLayer */}
      {/* <TextLayer
        position={[111, 34.2]}
        config={{ size: 18, color: 'red' }}
        absoluteSize={true}
        controlsRef={controlsRef}
      >
        这是文字图层
      </TextLayer> */}
      {/* imageLayer */}
      {/* <ImageLayer
        img={ICON}
        position={[111, 34.1]}
        width={23}
        height={20}
        absoluteSize={true}
        controlsRef={controlsRef}
      /> */}

      {/* dashed line */}
      {/* <mesh position={[0, 0, 0]}>
        <CustomCurve />
      </mesh> */}
      <OrbitControls
        target={target}
        ref={controlsRef as any}
      />
    </>
  )
}

function Light() {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D())
  const { scene } = useThree()

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      // 将光源的目标设置为目标对象
      lightRef.current.target = targetRef.current
      // 将目标对象添加到场景中
      scene.add(targetRef.current)

      // 设置目标对象的位置为你想要的位置，例如 [10, 10, 0]
      targetRef.current.position.set(center[0], center[1], 0)

      // 创建一个 DirectionalLightHelper 并添加到场景中
      const helper = new THREE.DirectionalLightHelper(lightRef.current, 0.1, '#fff')
      scene.add(helper)

      // 清理函数
      return () => {
        scene.remove(helper)
        scene.remove(targetRef.current)
      }
    }
  }, [scene])

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight
        ref={lightRef}
        position={[center[0] + 1, center[1] + 1, 1]} // 确保光源位置设置正确
        intensity={1.5}
      />
    </>
  )
}

function App() {
  return (
    <>
      <Canvas
        gl={{
          preserveDrawingBuffer: true, // 启用 preserveDrawingBuffer
          logarithmicDepthBuffer: true,
        }}
        style={{ height: '100vh', width: '100vw' }}
        camera={{ position: [center[0], center[1], cameraHeight] }}
      >
        <Light />
        <Scene />

        <gridHelper
          args={[10, 100, '#333333', '#999999']} // 每个格子长0.1
          position={[center[0], center[1], 0]}
          rotation={[Math.PI / 2, 0, 0]} // 旋转至ZX面
        />
      </Canvas>
    </>
  )
}

export default App
