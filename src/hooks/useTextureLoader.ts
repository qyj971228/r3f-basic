import html2canvas from 'html2canvas'
import { useEffect, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import * as THREE from 'three'
import { StackingSpacing, center, cameraHeight, scaleFactor } from '../map.config'

// 材质优化
function textureOptimization(texture: THREE.Texture) {
  // 插值
  texture.minFilter = THREE.LinearMipMapLinearFilter
  texture.magFilter = THREE.LinearFilter

  // mipmap生成
  texture.generateMipmaps = true

  return texture
}

export const useTextureIMGLoader = (img: string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(img, loadedTexture => {
      setTexture(textureOptimization(loadedTexture))
    })
  }, [])

  return texture
}

export const useTextureDomLoader = (dom: React.ReactNode | string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [shapeSize, setShapeSize] = useState<[number, number]>([1, 1])

  // 生成材质并渲染shape
  useEffect(() => {
    const childrenContainer = document.createElement('div')
    // 用于获取正确的渲染宽高
    childrenContainer.style.height = 'fit-content'
    childrenContainer.style.width = 'fit-content'

    // 将元素放置到视口外
    childrenContainer.style.position = 'absolute'
    childrenContainer.style.top = '-99999px'
    childrenContainer.style.left = '-99999px'

    // dom node转为字符串
    const inner = typeof dom === 'string' ? dom : ReactDOMServer.renderToStaticMarkup(dom)
    childrenContainer.innerHTML = inner
    document.body.appendChild(childrenContainer)

    // 获取渲染宽高
    const rect = childrenContainer.getBoundingClientRect()

    // 从dom获取材质
    html2canvas(childrenContainer, {
      backgroundColor: null,
      scale: 10,
    }).then(canvas => {
      const texture = new THREE.CanvasTexture(canvas)
      document.body.removeChild(childrenContainer)

      // 材质
      setTexture(textureOptimization(texture))
      // shape尺寸
      setShapeSize([rect.width * scaleFactor, rect.height * scaleFactor])
    })
  }, [dom])

  return { texture, shapeSize }
}
