import * as THREE from 'three'

// 三维包围盒计算
export const uv3DCompute = (meshRef: React.RefObject<THREE.Mesh>) => {
  if (!meshRef.current) return
  const geometry = meshRef.current.geometry
  // 计算几何体的边界框
  geometry.computeBoundingBox()

  // 计算 UV 值
  const positionAttribute = geometry.attributes.position
  const uvArray = new Float32Array(positionAttribute.count * 2)

  if (!geometry.boundingBox) return

  const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x
  const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i)
    const y = positionAttribute.getY(i)

    // 将位置映射到 UV 值（范围 [0, 1]）
    uvArray[i * 2] = (x - geometry.boundingBox.min.x) / width
    uvArray[i * 2 + 1] = (y - geometry.boundingBox.min.y) / height
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
  geometry.attributes.uv.needsUpdate = true
}

// 二维包围盒计算
export const uv2DCompute = (meshRef: React.RefObject<THREE.Mesh>) => {
  if (!meshRef.current) return
  const geometry = meshRef.current.geometry
  const boundingBox = new THREE.Box3().setFromObject(meshRef.current) // 获取几何体的包围盒

  // 如果包围盒有效，则继续计算 UV
  if (boundingBox.isEmpty()) {
    return // 如果包围盒为空，直接跳过
  }

  const uvs = geometry.attributes.uv.array
  const width = boundingBox.max.x - boundingBox.min.x // 计算宽度
  const height = boundingBox.max.y - boundingBox.min.y // 计算高度

  for (let i = 0; i < uvs.length; i += 2) {
    const x = uvs[i]
    const y = uvs[i + 1]

    // 使用包围盒的尺寸将 UV 映射到 [0, 1] 范围
    uvs[i] = x / width
    uvs[i + 1] = y / height
  }

  geometry.attributes.uv.needsUpdate = true // 标记 UV 更新
  geometry.center() // 可选：居中几何体
}
