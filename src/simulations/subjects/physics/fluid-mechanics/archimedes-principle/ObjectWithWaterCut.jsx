import React, { useMemo, forwardRef } from "react";
import * as THREE from "three";
import { WATER_LEVEL } from "./constants";

const Geometry = ({ type, args }) => {
  if (type === "sphere") return <sphereGeometry args={args} />;
  if (type === "cylinder") return <cylinderGeometry args={args} />;
  if (type === "cone") return <coneGeometry args={args} />;
  return <boxGeometry args={args} />;
};

const ObjectWithWaterCut = forwardRef(
  ({ shapeData, color, underwaterColor }, ref) => {
    const clipPlaneAbove = useMemo(
      () => [new THREE.Plane(new THREE.Vector3(0, 1, 0), -WATER_LEVEL)],
      []
    );
    const clipPlaneBelow = useMemo(
      () => [new THREE.Plane(new THREE.Vector3(0, -1, 0), WATER_LEVEL)],
      []
    );

    return (
      <group ref={ref}>
        {/* 
         We wrap the mesh in a group to handle the rotation.
         Physics moves the REF (the outer group). 
         The mesh inside is rotated relative to that center.
      */}
        <group rotation={shapeData.rotation || [0, 0, 0]}>
          {/* ABOVE WATER PART */}
          <mesh castShadow receiveShadow>
            <Geometry
              type={shapeData.geometryType}
              args={shapeData.geometryArgs}
            />
            <meshStandardMaterial
              color={color}
              roughness={0.2}
              metalness={0.1}
              clippingPlanes={clipPlaneAbove}
              clipShadows={true}
            />
          </mesh>

          {/* BELOW WATER PART */}
          <mesh>
            <Geometry
              type={shapeData.geometryType}
              args={shapeData.geometryArgs}
            />
            <meshStandardMaterial
              color={underwaterColor}
              roughness={0.2}
              metalness={0.1}
              clippingPlanes={clipPlaneBelow}
              clipShadows={true}
            />
          </mesh>
        </group>
      </group>
    );
  }
);

export default ObjectWithWaterCut;
