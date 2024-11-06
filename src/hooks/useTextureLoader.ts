import { useEffect, useState } from 'react'
import * as THREE from 'three'

export const useTextureLoader = (img: string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(img, loadedTexture => {
      setTexture(loadedTexture)
    })
  }, [])

  return texture
}
