import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Curve3D: React.FC = () => {
  const boxRefs = useRef<THREE.Mesh[]>([])
  const clockRef = useRef(new THREE.Clock())

  const startPoint = new THREE.Vector3(112, 35, 0)
  const endPoint = new THREE.Vector3(111, 34, 0)
  const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5)
  const height = 0.3
  const extensionLength = 0.05 // 延长的长度

  // 计算控制点
  const controlPoint1 = new THREE.Vector3(midPoint.x, midPoint.y, midPoint.z + height)
  const controlPoint2 = new THREE.Vector3(midPoint.x, midPoint.y, midPoint.z + height)

  // 计算起点和终点延长的方向
  const startTangent = new THREE.Vector3().subVectors(controlPoint1, startPoint).normalize()
  const endTangent = new THREE.Vector3().subVectors(endPoint, controlPoint2).normalize()

  // 延长起点和终点
  const extendedStartPoint = startPoint.clone().sub(startTangent.multiplyScalar(extensionLength))
  const extendedEndPoint = endPoint.clone().add(endTangent.multiplyScalar(extensionLength))

  // 创建延长后的曲线
  const extendedCurve = new THREE.CubicBezierCurve3(
    extendedStartPoint,
    controlPoint1,
    controlPoint2,
    extendedEndPoint
  )

  const length = extendedCurve.getLength() // 获取延长后的曲线总长度
  const boxSpacing = 0.15 // 盒子之间的间隔
  const numBoxes = Math.floor(length / boxSpacing) // 计算需要的盒子数量

  // 创建裁剪平面，确保 z 轴下方的部分被裁剪隐藏
  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

  useFrame(() => {
    const time = clockRef.current.getElapsedTime() / 4

    boxRefs.current.forEach((boxRef, index) => {
      // 动态获取 t 值，确保均匀分布
      const t = (time + index / numBoxes) % 1
      const point = extendedCurve.getPoint(t) // 获取曲线上对应点
      const tangent = extendedCurve.getTangent(t) // 获取曲线在该点的切线

      if (boxRef) {
        boxRef.position.set(point.x, point.y, point.z)

        // 根据切线设置盒子的朝向
        const direction = new THREE.Vector3().copy(tangent).normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)

        // 创建一个额外的旋转四元数用于横滚45度
        const rollQuaternion = new THREE.Quaternion()
        rollQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4) // 横滚45度

        // 叠加额外的旋转到原始四元数
        quaternion.multiply(rollQuaternion)

        boxRef.setRotationFromQuaternion(quaternion)
      }
    })
  })

  return (
    <>
      <mesh />
      {Array.from({ length: numBoxes }).map((_, i) => (
        <mesh
          key={i}
          ref={el => {
            if (el) boxRefs.current[i] = el
          }}
          material={
            new THREE.MeshStandardMaterial({
              color: 'yellow',
              clippingPlanes: [clippingPlane],
            })
          }
        >
          <boxGeometry args={[0.025, 0.025, 0.08]} />
        </mesh>
      ))}
    </>
  )
}
