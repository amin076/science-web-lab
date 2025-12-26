# Satellites + Telescopes (Earth)

## Model (v1)

- 2D orbital dynamics in the equatorial plane (ECI-like).
- Newtonian gravity: a = -μ r / |r|^3
- RK4 integrator for stability.
- Ground telescope sits on Earth's equator and rotates with Earth (sidereal rate).
- Visibility (above horizon): (sat - site) · normal > 0

## Controls

- Time scale: accelerates simulation time relative to real time.
- dt: physics integration step (seconds).
- Trails / vectors / line-of-sight toggles.
- Presets: LEO / MEO / GEO / Space Telescope

## Next upgrades

- 3D coordinates + orbital elements (a,e,i,Ω,ω,ν)
- Inclination & ground track projection (lat/lon)
- Atmosphere drag / J2 perturbation (optional)
- Telescope FOV cone and target tracking
- Multiple ground stations + pass prediction (AOS/LOS)
