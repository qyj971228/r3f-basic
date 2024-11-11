import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Line2 } from 'three-stdlib'

// TODO: 根据曲线起止生成合适的贝塞尔曲线
// TODO: 曲线样式props
export function Curve() {
  // 使用 useMemo 优化曲线计算
  const points = useMemo(() => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(112, 35, 0),
      new THREE.Vector3(112, 34.5, 0.4),
      new THREE.Vector3(112, 34.5, 0.4),
      new THREE.Vector3(112, 34, 0)
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
        color='yellow'
        lineWidth={2}
        dashed={true}
        dashSize={0.1} // dashsize和gapsize相同的话会得到连续的运动
        gapSize={0.1}
        dashOffset={0}
      />
    </mesh>
  )
}
