import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { center } from '../map.config'

export function Light() {
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
