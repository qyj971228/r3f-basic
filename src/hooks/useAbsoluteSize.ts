import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { StackingSpacing, center, cameraHeight, scaleFactor } from '../map.config'

export const useAbsoluteSize = (meshRef: React.RefObject<THREE.Mesh>) => {
  const { camera } = useThree()

  // 绝对大小下设置动态缩放
  useFrame(() => {
    if (meshRef.current && camera) {
      // 获取相机与目标之间的距离
      const cameraDistance = camera.position.distanceTo(new THREE.Vector3(...center, 0))
      // 缩放比率
      let scaleFactor = cameraDistance / cameraHeight
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }
  })
}
