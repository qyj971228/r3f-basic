import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'

const MovingBoxes: React.FC = () => {
  const boxRefs = useRef<THREE.Mesh[]>([])
  const clockRef = useRef(new THREE.Clock())

  // 创建三维贝塞尔曲线
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(-10, 10, 0),
    new THREE.Vector3(10, 10, 0),
    new THREE.Vector3(10, 0, 0)
  )

  const numBoxes = 20 // 盒子数量
  const timeOffset = 0.25 // 每个盒子之间的时间间隔

  useFrame(() => {
    const time = clockRef.current.getElapsedTime()

    boxRefs.current.forEach((boxRef, index) => {
      const t = ((time + index * timeOffset) % 5) / 5 // 匀速移动，每5秒循环一次
      const point = curve.getPoint(t) // 获取曲线上对应点
      const tangent = curve.getTangent(t) // 获取曲线在该点的切线

      if (boxRef) {
        boxRef.position.set(point.x, point.y, point.z)

        // 根据切线设置盒子的朝向
        const direction = new THREE.Vector3().copy(tangent).normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction)
        boxRef.setRotationFromQuaternion(quaternion)
      }
    })
  })

  return (
    <>
      {Array.from({ length: numBoxes }).map((_, i) => (
        <mesh
          key={i}
          ref={el => {
            if (el) boxRefs.current[i] = el
          }}
        >
          <boxGeometry args={[0.8, 0.4, 0.8]} />
          <meshStandardMaterial color='skyblue' />
        </mesh>
      ))}
    </>
  )
}

const App: React.FC = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <MovingBoxes />
      <OrbitControls />
      <gridHelper
        args={[100, 100, '#333333', '#999999']} // 每个格子长0.1
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]} // 旋转至ZX面
      />
    </Canvas>
  )
}

export default App
