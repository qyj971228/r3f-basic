import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { cameraHeight } from '../map.config'

export const useAbsoluteSize = (meshRef: React.RefObject<THREE.Mesh>) => {
  const { camera } = useThree()

  // 绝对大小下设置动态缩放
  useFrame(() => {
    if (meshRef.current && camera) {
      // 获取相机与相机在地图平面投影的距离
      // const cameraDistance = camera.position.distanceTo(
      //   new THREE.Vector3(camera.position.x, camera.position.y, 0)
      // )
      // 事实上就是相机的position.z
      // 缩放比率
      const scaleFactor = camera.position.z / cameraHeight
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }
  })
}
