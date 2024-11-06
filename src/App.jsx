/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber'
import './App.css'
import { useRef, useState, useEffect } from 'react'
import { MeshWobbleMaterial, OrbitControls, useHelper, Line } from '@react-three/drei'
import { DirectionalLightHelper, Vector3, MOUSE } from 'three'
import { useControls } from 'leva'
import { useSpring, animated } from '@react-spring/three'
import CustomObject from './3DMap'
import TexttureObject from './textTure'
import TileMap from './Scale'

const Cube = ({ position, size, color }) => {
  const ref = useRef()
  useFrame((state, delta) => {
    // state 帧信息; delta 每一帧使用的时间(秒)
    // console.log(state, delta)
    // state.clock.elapsedTime 经过时间
    ref.current.rotation.x += (delta * Math.PI) / 4
    ref.current.rotation.y += delta * Math.PI
    ref.current.position.z += Math.sin(state.clock.elapsedTime) * 0.01
  })
  return (
    <mesh
      position={position}
      ref={ref}
    >
      {/* 模型 */}
      <boxGeometry args={size} />
      {/* 材质 */}
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const Sphere = ({ position, size, color }) => {
  const ref = useRef()

  const [isHorvered, setIsHovered] = useState()
  const [isClicked, setIsClicked] = useState()

  const { scale } = useSpring({ scale: isClicked ? 1.5 : 1 })

  useFrame((state, delta) => {
    const speed = isHorvered ? 1 : 0.5
    ref.current.rotation.x += (delta * Math.PI) / 4 / speed
    ref.current.rotation.y += (delta * Math.PI) / 4 / speed
  })
  return (
    <animated.mesh
      position={position}
      scale={scale}
      ref={ref}
      onPointerEnter={e => (e.stopPropagation(), setIsHovered(true))}
      onPointerLeave={e => (e.stopPropagation(), setIsHovered(false))}
      onClick={e => (e.stopPropagation(), setIsClicked(!isClicked))}
    >
      <sphereGeometry args={size} />
      <meshStandardMaterial
        color={isHorvered ? 'red' : color}
        wireframe
      />
    </animated.mesh>
  )
}

const Tours = ({ position, size, color }) => {
  return (
    <mesh position={position}>
      <torusGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const ToursKnot = ({ position, size, color }) => {
  const { factor, speed } = useControls({
    factor: {
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
    },
    speed: {
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
    },
  })
  return (
    <mesh position={position}>
      <torusKnotGeometry args={size} />
      <MeshWobbleMaterial
        factor={factor}
        speed={speed}
        color={color}
      />
    </mesh>
  )
}

const Scene = () => {
  const directionalLightRef = useRef()

  const { lightColor, lightIntensity } = useControls({
    lightColor: 'red',
    lightIntensity: {
      value: 0.5,
      min: 0,
      max: 5,
      step: 0.1,
    },
  })

  // 光源辅助
  useHelper(directionalLightRef, DirectionalLightHelper, 0.5, 'red')

  return (
    <>
      {/* 光照 */}
      <directionalLight
        position={[0, 0, 2]}
        intensity={lightIntensity}
        color={lightColor}
        ref={directionalLightRef}
      />
      {/* <ambientLight intensity={0.5} /> */}
      {/* 分组 */}
      {/* <group position={[0, -1, 0]}>
        <Cube
          position={[1, 0, 0]}
          size={[1, 1, 1]}
          color={'red'}
        />
        <Cube
          position={[-1, 0, 0]}
          size={[1, 1, 1]}
          color={'green'}
        />
        <Cube
          position={[-1, 2, 0]}
          size={[1, 1, 1]}
          color={'orange'}
        />
        <Cube
          position={[1, 2, 0]}
          size={[1, 1, 1]}
          color={'blue'}
        />
      </group> */}
      {/* 正六面体 */}
      {/* <Cube
        position={[0, -2, 0]}
        size={[1, 1, 1]}
        color={'red'}
      /> */}
      {/* 球体 */}
      {/* <Sphere
        position={[0, 0, 0]}
        size={[1, 32, 16]}
        color={'orange'}
      /> */}
      {/* 环 */}
      {/* <Tours
        position={[3, 0, 0]}
        size={[0.8, 0.1, 30, 30]}
        color={'pink'}
      /> */}
      {/* <ToursKnot
        position={[-3, 0, 0]}
        size={[2, 0.1, 1000, 50]}
        color={'blue'}
      /> */}
      <OrbitControls />
    </>
  )
}

function App() {
  // return <TexttureObject />;
  // return <CustomObject />
  return <TileMap />
}

export default App
