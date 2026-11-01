/* Discover 3D simulations by their actual Drei OrbitControls imports.
 * Runs once during catalog generation; no individual simulation files are modified.
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
function walk(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry => {
    const file=path.join(root,entry.name);
    return entry.isDirectory() ? walk(file) : /\.[jt]sx?$/.test(file) ? [file] : [];
  });
}
function discoverThreeCameraIds(catalog) {
  const base=path.join(ROOT,"src","simulations","subjects");
  const sources=walk(base).filter(file => {
    const code=fs.readFileSync(file,"utf8");
    return /import\s*\{[^}]*\bOrbitControls\b[^}]*\}\s*from\s*['"]@react-three\/drei['"]/.test(code) ||
      code.includes('from "@/components/shared/ThreeDCanvas"') || code.includes("from '@/components/shared/ThreeDCanvas'");
  }).map(file=>file.replaceAll("\\","/"));
  const registry=fs.readFileSync(path.join(ROOT,"src/simulations/registry/index.js"),"utf8");
  const refs=new Map();
  const re=/"([^"]+)"\s*:\s*lazyWithRetry\(\s*\(\)\s*=>\s*import\(\s*["']@\/simulations\/subjects\/([^"']+)/g;
  for(const match of registry.matchAll(re)) refs.set(match[1],match[2]);
  const standard=fs.readFileSync(path.join(ROOT,"src/simulations/definitions/generated.js"),"utf8");
  const reStandard=/"id":"([^"]+)"[^\n]*?load:\s*\(\)\s*=>\s*import\(["']@\/simulations\/subjects\/([^"']+)/g;
  for(const match of standard.matchAll(reStandard)) refs.set(match[1],match[2]);
  const supported = catalog.filter(sim => {
    if (sim.id==="physics.mechanics.gearbox-differential-3d" || sim.id==="astronomy.space.solar-system") return false;
    const folder=refs.get(sim.id);
    if (!folder) return false;
    const dir=path.join(base,folder).replaceAll("\\","/");
    return sources.some(src=>src.startsWith(dir + "/") || src===dir+".jsx" || src===dir+".js");
  }).map(sim=>sim.id).sort();
  return supported;
}
module.exports={discoverThreeCameraIds};
