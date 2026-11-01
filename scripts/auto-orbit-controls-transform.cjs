/* Build-time instrumentation for every standard React Three Fiber OrbitControls import.
 * No per-simulation camera wiring; only real Drei OrbitControls instances are wrapped.
 * The Solar System retains its existing verified camera bridge.
 */
const CAMERA_BRIDGE_IMPORT = "@/platform/agent/AutoOrbitControls.jsx";
function transformOrbitControls(source, id = "") {
  if (!(id.replaceAll("\\", "/").includes("/src/simulations/subjects/") ||
        id.replaceAll("\\", "/").endsWith("/src/components/shared/ThreeDCanvas.jsx")) ||
      id.includes("/solar-system/") || !source.includes("OrbitControls") ||
      !source.includes("@react-three/drei")) return null;
  const pattern = /import\s*\{([^}]+)\}\s*from\s*(['"])@react-three\/drei\2\s*;?/g;
  let changed = false;
  const transformed = source.replace(pattern, (whole, members, quote) => {
    const parts = members.split(",").map(part => part.trim()).filter(Boolean);
    const controls = parts.filter(part => part === "OrbitControls");
    if (!controls.length) return whole;
    changed = true;
    const rest = parts.filter(part => part !== "OrbitControls");
    return rest.length
      ? `import { ${rest.join(", ")} } from ${quote}@react-three/drei${quote};`
      : "";
  });
  if (!changed) return null;
  return {
    code: `import { AutoOrbitControls as OrbitControls } from "${CAMERA_BRIDGE_IMPORT}";\n` + transformed,
    map: null
  };
}
module.exports = { transformOrbitControls };
