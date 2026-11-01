/** Three.js OrbitControls bridge. Mutates the real camera and updates controls. */
import { Vector3, Spherical } from "three";

export function createThreeOrbitCameraAdapter({ camera, controls, initialState }) {
  if (!camera || !controls) throw new TypeError("Three camera and OrbitControls are required");
  const saved = initialState ?? {
    position: camera.position.clone(), target: controls.target.clone(), zoom: camera.zoom,
  };
  const offset = new Vector3(), right = new Vector3(), up = new Vector3();
  const spherical = new Spherical();
  const commit = () => { camera.updateProjectionMatrix(); controls.update(); };
  return {
    read: () => ({
      position: camera.position.toArray(), target: controls.target.toArray(),
      distance: camera.position.distanceTo(controls.target), zoom: camera.zoom,
    }),
    zoom: ({factor}) => {
      offset.copy(camera.position).sub(controls.target);
      const radius = offset.length();
      if (!radius) throw new Error("Camera has no focus distance");
      const next = Math.max(controls.minDistance || 0.01,
        Math.min(controls.maxDistance || Infinity, radius / factor));
      camera.position.copy(controls.target).addScaledVector(offset, next / radius);
      commit();
    },
    pan: ({horizontal, vertical}) => {
      const distance = camera.position.distanceTo(controls.target);
      const height = camera.isPerspectiveCamera
        ? 2 * distance * Math.tan((camera.fov * Math.PI / 180) / 2)
        : (camera.top - camera.bottom) / camera.zoom;
      const width = height * (camera.aspect || 1);
      camera.getWorldDirection(right);
      right.cross(camera.up).normalize();
      up.copy(camera.up).normalize();
      const delta = right.multiplyScalar(-horizontal * width)
        .add(up.multiplyScalar(vertical * height));
      camera.position.add(delta);
      controls.target.add(delta);
      commit();
    },
    orbit: ({yawDegrees, pitchDegrees}) => {
      offset.copy(camera.position).sub(controls.target);
      spherical.setFromVector3(offset);
      spherical.theta += yawDegrees * Math.PI / 180;
      spherical.phi -= pitchDegrees * Math.PI / 180;
      spherical.makeSafe();
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
      commit();
    },
    reset: () => {
      camera.position.copy(saved.position);
      controls.target.copy(saved.target);
      camera.zoom = saved.zoom;
      commit();
    },
  };
}
