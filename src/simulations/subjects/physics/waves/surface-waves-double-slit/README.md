# Surface Waves + Double-Slit (Ripple Tank)

This simulation demonstrates 2D surface waves and Young’s double-slit interference using a simple finite-difference wave equation on a grid.

## Features

- Continuous wave source (sinusoidal drive)
- Click-to-inject pulse (localized disturbance)
- Toggleable double-slit barrier
- Adjustable slit width, separation, barrier position
- Damping and wave-speed controls
- Render mode:
  - Height (u)
  - Intensity (u²)

## Notes

- This is an educational approximation (not a full fluid solver).
- For best interference patterns:
  - Enable barrier
  - Increase frequency slightly (e.g., 1.5–2.5 Hz)
  - Use moderate damping (0.01–0.03)
  - Use a narrower slit width and medium separation
