import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { useFontLoader } from '../hooks/useFontLoader'

type TextLayerProps = {
  position: [number, number, number]
  config: {
    size: number
    color: string
    font?: string
  }
  children: React.ReactNode // 添加children，允许直接渲染文本内容
}

export const TextLayer = (props: TextLayerProps) => {
  const {
    position: propsPosition,
    config: { size: propsSize, color: propsColor, font: propsFont },
    children,
  } = props

  let text

  // 获取children的文本内容
  if (typeof children === 'string') {
    text = children
  } else {
    // TODO: 如果是dom 则将dom内容作为纹理渲染
  }

  // 加载字体
  const font = useFontLoader(propsFont)

  if (!font || !text) {
    return null
  }

  // 创建文本几何体
  const textGeometry = new TextGeometry(text, {
    font: font, // 使用加载的字体
    size: propsSize, // 调整字体大小
    depth: 0, // 字体深度
    curveSegments: 12, // 曲线段数
  })

  // 调整文本几何体的位置，使文本显示在中心
  textGeometry.center()

  // 材质
  const material = new THREE.MeshBasicMaterial({ color: propsColor })

  return (
    <mesh
      position={propsPosition}
      geometry={textGeometry}
      material={material}
    />
  )
}
