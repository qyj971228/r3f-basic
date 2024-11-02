/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";
import "./App.css";
import { useState, useEffect } from "react";
import { OrbitControls, Line } from "@react-three/drei";
import { Vector3, MOUSE } from "three";
import locations from "./location.json";

export function App() {
  const [vertices, setVertices] = useState([]);
  const center = [111.194099, 34.297338];
  const target = new Vector3(...center, 0);

  useEffect(() => {
    const newVertices = locations.map(([lat, lon]) => new Vector3(lat, lon, 0));
    setVertices(newVertices);
  }, []);

  return (
    <Canvas camera={{ position: [...center, 1.1] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Line points={vertices} color="blue" lineWidth={1} />
      <OrbitControls
        target={target}
        enablePan={true}
        enableRotate={false}
        enableZoom={true}
        mouseButtons={{
          LEFT: MOUSE.PAN,
          MIDDLE: MOUSE.MIDDLE,
          RIGHT: null,
        }}
      />
    </Canvas>
  );
}
