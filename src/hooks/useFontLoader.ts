import { useEffect, useState } from 'react'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import DEFAULT_FONT from '../assets/font-cn.json'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

export const useFontLoader = (fontJSONObj?: string) => {
  const [font, setFont] = useState<Font | null>(null)

  useEffect(() => {
    const loader = new FontLoader()
    const loadedFont = loader.parse((fontJSONObj ?? DEFAULT_FONT) as any)
    setFont(loadedFont)
  }, [])

  return font
}
