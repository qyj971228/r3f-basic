import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'
import { useTextureLoader } from '../hooks/useTextureLoader'

export type ImageLayerProps = {
  img: string
  center: [number, number]
  width: number
  height: number
}

export const ImageLayer = ({ img, center, width, height }: ImageLayerProps) => {
  // 加载材质
  const texture = useTextureLoader(img)

  // 过渡动画：仅当纹理加载完成时透明度变为1，否则保持为0
  const { opacity } = useSpring({
    opacity: texture ? 1 : 0,
    config: { tension: 200, friction: 20 },
  })

  // 创建矩形形状
  const shape = new THREE.Shape()
  const halfWidth = width / 2
  const halfHeight = height / 2
  shape.moveTo(center[0] - halfWidth, center[1] + halfHeight) // 左上
  shape.lineTo(center[0] + halfWidth, center[1] + halfHeight) // 右上
  shape.lineTo(center[0] + halfWidth, center[1] - halfHeight) // 右下
  shape.lineTo(center[0] - halfWidth, center[1] - halfHeight) // 左下
  shape.closePath()

  // 将 shape 转换为 BufferGeometry
  const geometry = new THREE.ShapeGeometry(shape)

  // 获取 UV 坐标并更新：通过矩形的宽高比例映射纹理
  const uvs = geometry.attributes.uv.array
  const widthRatio = 1 / width
  const heightRatio = 1 / height

  for (let i = 0; i < uvs.length; i += 2) {
    const x = uvs[i]
    const y = uvs[i + 1]

    uvs[i] = (x - (center[0] - halfWidth)) * widthRatio // x 坐标的 UV 映射
    uvs[i + 1] = (y - (center[1] - halfHeight)) * heightRatio // y 坐标的 UV 映射
  }

  // 更新 UV 坐标
  geometry.attributes.uv.needsUpdate = true

  return (
    <mesh geometry={geometry}>
      <animated.meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent={true}
        opacity={opacity as unknown as number} // 更优雅的类型转换
      />
    </mesh>
  )
}
