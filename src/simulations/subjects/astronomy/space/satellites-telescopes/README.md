# Satellites & Telescopes Simulator

A real-time 2D orbital mechanics simulation showing satellites and telescopes orbiting Earth, with ground station visibility tracking.

## Features

✅ **Realistic orbital physics** (RK4 integration, Newtonian gravity)  
✅ **Multiple satellite types** (ISS, LEO, MEO, GEO, Space Telescope)  
✅ **Ground station visibility** (line-of-sight tracking)  
✅ **Orbital trails & velocity vectors**  
✅ **Real-time orbital parameters** (altitude, velocity, period)  
✅ **Time acceleration** (1× to 500×)  
✅ **Stars background & Earth atmosphere glow**

## How to Use

1. **Add satellites**: Use the preset buttons (LEO/MEO/GEO/HST)
2. **Control time**: Adjust time scale slider (1× - 500×)
3. **Toggle displays**: Show/hide trails, velocity vectors, line-of-sight
4. **Monitor visibility**: Green line = satellite visible from ground station
5. **Remove satellites**: Click the trash icon in the objects list

## Orbital Types

- **LEO (Low Earth Orbit)**: ~500 km altitude, ~90 min period
- **MEO (Medium Earth Orbit)**: ~20,200 km altitude, ~12 hours period
- **GEO (Geostationary)**: ~35,786 km altitude, ~24 hours period
- **ISS**: ~408 km altitude, ~92 min period
- **HST (Hubble)**: ~547 km altitude, ~95 min period

## Technical Details

### Physics Model
- 2D equatorial plane simulation
- Newtonian gravity: F = -GMm/r²
- RK4 (Runge-Kutta 4th order) integration
- Earth rotation: sidereal rate (23h 56m 4s)

### Visibility Calculation
Satellite is visible when: `(sat_position - site_position) · site_normal > 0`

This checks if the satellite is above the local horizon.

## Known Limitations

- **2D only** (equatorial plane, no inclination)
- **No atmospheric drag**
- **No J2 perturbation** (Earth oblateness effect)
- **No collision detection**
- **Simplified visibility** (no atmospheric refraction or terrain)

## Future Enhancements

- 3D orbital mechanics with inclination (i, Ω, ω)
- Ground track projection (lat/lon)
- Telescope field-of-view cone
- Pass prediction (AOS/LOS times)
- Atmospheric drag model
- J2 perturbation for realistic LEO decay
- Multiple ground stations
- Orbital maneuvers (Hohmann transfer, plane changes)

## Controls Reference

| Control | Description |
|---------|-------------|
| **Time scale** | Speed up simulation (1× to 500×) |
| **Physics step** | Integration timestep (0.05s to 2s) |
| **Show trails** | Display orbital paths |
| **Show vectors** | Display velocity vectors |
| **Show LOS** | Display line-of-sight from ground |
| **Show stars** | Toggle background stars |
| **Reset** | Clear all objects and restart |
| **Play/Pause** | Control simulation |

## Constants

- Earth radius: 6,371 km
- Earth μ (GM): 398,600.4418 km³/s²
- Sidereal day: 86,164.0905 seconds

## Credits

Built with React, Material-UI, and HTML5 Canvas.  
Physics engine uses RK4 integration for numerical stability.

## Solar and lunar reference model

- Earth follows a Kepler ellipse: semimajor axis 149,597,870.7 km, eccentricity 0.0167, sidereal period 365.256363004 days. The Sun is at a focus. The view rotates to keep the anti-solar axis horizontal.
- Both modes now use linear kilometres for positions AND body radii. Apparent tiny-body dots and spacecraft icons are labelled visibility markers, not physical sizes. Select Earth, Moon or a mission for a local view; select Sun for the full annual ellipse. The separate context card is explicitly not to scale.
- Webb is a reference marker at +1,500,000 km along the anti-solar axis. It is never integrated under Earth-only gravity and has no Earth-centred orbit or trail. Its actual halo orbit around L2 is not modelled; this is not a live ephemeris.
- Tiangong uses a representative 400 km Earth orbit; Starlink is a representative 550 km orbit, not a complete constellation.
- LRO uses its original 50 km lunar reference orbit. Gateway (planned) and CAPSTONE (historical, NASA activities ended June 2026) use illustrative 2D eccentric paths with a 6.5-day period. These are geometric NRHO approximations, not three-body integrations or current flight trajectories.
- Reset preserves displayed missions and resets reference time and positions.

Sources: https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html ; https://science.nasa.gov/mission/webb/orbit/ ; https://www.nasa.gov/gateway-frequently-asked-questions/ ; https://www.nasa.gov/mission/capstone/ ; https://science.nasa.gov/mission/lro/spacecraft-and-instruments/ ; https://www.cnsa.gov.cn/english/n6465652/n6465653/c6809605/content.html
