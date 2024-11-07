import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { OrbitControls, Line } from '@react-three/drei'
import { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import ICON from './assets/react.svg'
import MAP from './assets/map.png'
import LOCATION_JSON from './assets/location.json'
import { ImageLayer } from './components/ImageLayer'
import { TextLayer } from './components/TextLayer'
import { DomLayer } from './components/DomLayer'
import { MapLayer } from './components/MapLayer'
import { Line2 } from 'three-stdlib'

export const StackingSpacing = 0.001
const center = [111.194099, 34.297338]
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
    const offsetStep = 0.001
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

function CustomObject() {
  const controlsRef = useRef<OrbitControlsType>(null)

  const target = new THREE.Vector3(...center, 0)

  return (
    <>
      {/* 3D模型 */}
      <MapLayer
        height={0.1}
        positions={LOCATION_JSON as [number, number][]}
      />
      <MapLayer
        img={MAP}
        height={0}
        positions={LOCATION_JSON as [number, number][]}
      />
      {/* textLayer */}
      <TextLayer
        position={[111, 34.2]}
        config={{ size: 18, color: 'red' }}
        absoluteSize={true}
        controlsRef={controlsRef}
      >
        这是文字图层
      </TextLayer>
      {/* imageLayer */}
      <ImageLayer
        img={ICON}
        position={[111, 34.1]}
        width={23}
        height={20}
        absoluteSize={true}
        controlsRef={controlsRef}
      />
      {/* domlayer */}
      <DomLayer
        position={[111, 33.9]}
        absoluteSize={true}
        controlsRef={controlsRef}
      >
        <div
          style={{
            display: 'flex',
            color: 'yellow',
            fontSize: '18px',
          }}
        >
          <img
            src={ICON}
            style={{ height: '20px', width: '20px' }}
          ></img>
          <div>这是一个打点</div>
        </div>
      </DomLayer>
      {/* dashed line */}
      <mesh position={[0, 0, 0]}>
        <CustomCurve />
      </mesh>
      <OrbitControls
        target={target}
        ref={controlsRef as any}
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
        style={{ height: '100vh', width: '100wh' }}
        camera={{ position: [center[0], center[1], cameraHeight] }}
      >
        {/* 明确禁用所有环境光 */}
        <ambientLight intensity={1} />
        <directionalLight
          position={[center[0] + 1, center[1] + 1, cameraHeight + 1]}
          intensity={100}
        />
        <CustomObject />
      </Canvas>
    </>
  )
}

export default App
