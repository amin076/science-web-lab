# Earth Orbit Lab (3D)

Simulation ID: `astronomy.space.earth-orbit-lab`

Features (Step 3):
- 2-body orbital motion (Earth gravity) using Velocity-Verlet integrator
- Ground telescope (lat/lon) on Earth surface
- Earth rotation (sidereal rate) affecting observer inertial position
- Line-of-Sight visibility (blocked by Earth) + elevation angle
- Optional trails, velocity vectors, labels

Notes:
- Uses spherical Earth model (upgradeable to WGS84 later).
- Units: SI internally (meters, seconds).
- Rendering uses a scale where Earth radius = 1 render unit.
