import { Canvas } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
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
import { useControls } from 'leva'
import { center, cameraHeight } from './map.config'
import { Light } from './components/Light'
import { Curve } from './components/Curve'
import { Curve3D } from './components/Curve3D'

function Scene() {
  const controlsRef = useRef<OrbitControlsType>(null)

  const target = new THREE.Vector3(...center, 0)

  const [scale, setScale] = useState(1)

  useControls({
    scale: {
      value: 1,
      min: 0.1,
      max: 1,
      onChange: value => {
        setScale(value)
      },
    },
  })

  return (
    <>
      {/* 3D模型 */}

      <group
        scale={scale}
        position={[center[0] * (1 - scale), center[1] * (1 - scale), 0]}
      >
        {/* imageLayer */}
        <ImageLayer
          img={ICON}
          position={[111, 34.1]}
          width={23}
          height={20}
          dependents={[scale]}
          absoluteSize={true}
        />

        {/* textLayer */}
        <TextLayer
          position={[111, 34.2]}
          config={{ size: 18, color: 'red' }}
          absoluteSize={true}
        >
          这是文字图层
        </TextLayer>
        <MapLayer
          height={0.05}
          showEdge={true}
          positions={LOCATION_JSON as [number, number][]}
        />
        <MapLayer
          img={MAP}
          height={0}
          dependents={[scale]}
          positions={LOCATION_JSON as [number, number][]}
        />
        {/* domlayer */}
        <DomLayer
          position={[111, 33.9]}
          absoluteSize={true}
        >
          <div
            style={{
              display: 'flex',
              color: 'red',
              fontSize: '18px',
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

      {/* dashed line */}
      <Curve />
      <Curve3D />

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
