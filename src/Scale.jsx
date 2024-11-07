/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// 这是一个几何体不随相机位置变化大小的三维二维对比demo
function Scene() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.1, 0);
  shape.lineTo(0.1, 0.1);
  shape.lineTo(0, 0.1);
  shape.lineTo(0, 0);

  const extrudeSettings = { depth: 0.1, bevelEnabled: false };

  const controlsRef = useRef();
  const meshRef = useRef();
  const meshRef2 = useRef();

  useFrame(() => {
    if (meshRef.current && controlsRef.current) {
      // 获取相机与目标之间的距离
      const cameraDistance = controlsRef.current.object.position.distanceTo(
        controlsRef.current.target
      );
      const cameraDistanceDefault = 5; // 默认相机高度为5
      let scaleFactor = cameraDistance / cameraDistanceDefault;
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    if (meshRef2.current && controlsRef.current) {
      // 获取相机与目标之间的距离
      const cameraDistance = controlsRef.current.object.position.distanceTo(
        controlsRef.current.target
      );
      const cameraDistanceDefault = 5; // 默认相机高度为5
      let scaleFactor = cameraDistance / cameraDistanceDefault;
      console.log(scaleFactor);
      meshRef2.current.scale.set(scaleFactor, scaleFactor, 0);
    }
  });

  const shape2 = new THREE.Shape();
  shape2.moveTo(0, 0);
  shape2.lineTo(0.1, 0);
  shape2.lineTo(0.1, 0.1);
  shape2.lineTo(0, 0.1);
  shape2.lineTo(0, 0);

  return (
    <>
      <ambientLight />
      <mesh ref={meshRef}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          attach="material"
          color="green"
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-0.1, -0.1, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          attach="material"
          color="red"
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={meshRef2} position={[0.1, 0.1, 0]}>
        <shapeGeometry args={[shape2]} />
        <meshStandardMaterial color="orange" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0.2, 0.2, 0]}>
        <shapeGeometry args={[shape2]} />
        <meshStandardMaterial color="orange" side={THREE.DoubleSide} />
      </mesh>

      <OrbitControls ref={controlsRef} />
    </>
  );
}

function Scale() {
  return (
    <Canvas>
      <Scene></Scene>
    </Canvas>
  );
}

export default Scale;
