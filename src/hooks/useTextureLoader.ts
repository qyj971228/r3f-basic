import html2canvas from 'html2canvas'
import { useEffect, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import * as THREE from 'three'
import { scaleFactor } from '../3DMap'

export const useTextureIMGLoader = (img: string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(img, loadedTexture => {
      setTexture(loadedTexture)
    })
  }, [])

  return texture
}

export const useTextureDomLoader = (dom: React.ReactNode | string) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)
  const [shapeSize, setShapeSize] = useState<[number, number]>([1, 1])

  // 生成材质并渲染shape
  useEffect(() => {
    const childrenContainer = document.createElement('div')
    childrenContainer.style.height = 'fit-content'
    childrenContainer.style.width = 'fit-content'

    // dom node转为字符串
    childrenContainer.innerHTML =
      typeof dom === 'string' ? dom : ReactDOMServer.renderToStaticMarkup(dom)
    document.body.appendChild(childrenContainer)
    const rect = childrenContainer.getBoundingClientRect()

    // 从dom获取材质
    html2canvas(childrenContainer, {
      backgroundColor: null,
    }).then(canvas => {
      const newTexture = new THREE.CanvasTexture(canvas)
      document.body.removeChild(childrenContainer)
      // 材质
      setTexture(newTexture)
      // shape尺寸
      setShapeSize([rect.width * scaleFactor, rect.height * scaleFactor])
    })
  }, [dom])

  return { texture, shapeSize }
}
