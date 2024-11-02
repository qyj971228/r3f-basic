/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import IMG from "./assets/milkyway.png";
import locations from "./location.json";

export default function CustomObject() {
  const center = [111.194099, 34.297338];
  const target = new THREE.Vector3(...center, 0);

  const [geometry, setGeometry] = useState();
  const [texture, setTexture] = useState();

  useEffect(() => {
    const shape = new THREE.Shape();

    const [firstLat, firstLon] = locations[0];
    shape.moveTo(firstLat, firstLon);

    locations.forEach(([lat, lon]) => {
      shape.lineTo(lat, lon);
    });

    shape.lineTo(firstLat, firstLon);

    // 创建几何体
    const shapeGeometry = new THREE.ShapeGeometry(shape);

    // 计算几何体的边界框
    shapeGeometry.computeBoundingBox();

    // 计算 UV 值
    const positionAttribute = shapeGeometry.attributes.position;
    const uvArray = new Float32Array(positionAttribute.count * 2);

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);

      // 将位置映射到 UV 值（范围 [0, 1]）
      uvArray[i * 2] =
        (x - shapeGeometry.boundingBox.min.x) /
        (shapeGeometry.boundingBox.max.x - shapeGeometry.boundingBox.min.x);
      uvArray[i * 2 + 1] =
        (y - shapeGeometry.boundingBox.min.y) /
        (shapeGeometry.boundingBox.max.y - shapeGeometry.boundingBox.min.y);
    }

    shapeGeometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));

    setGeometry(shapeGeometry);
  }, []);

  // 加载纹理
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(IMG, (loadedTexture) => {
      // 确保纹理只显示一次
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
      // 设置纹理位置
      loadedTexture.offset.set(0, 0);
      setTexture(loadedTexture);
    });
  }, []);

  return (
    <Canvas camera={{ position: [...center, 1.2] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {geometry && texture && (
        <mesh geometry={geometry}>
          <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
      )}
      <OrbitControls target={target} />
    </Canvas>
  );
}
