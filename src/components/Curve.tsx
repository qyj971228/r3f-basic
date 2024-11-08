import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Line2 } from 'three-stdlib'

export function Curve() {
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
    <mesh>
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
    </mesh>
  )
}
