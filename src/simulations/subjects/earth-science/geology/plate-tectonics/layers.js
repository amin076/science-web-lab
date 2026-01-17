const EARTH_R_KM = 6371;
const SCALE_R = 4.0;

function to3D(km) {
  return (km / EARTH_R_KM) * SCALE_R;
}

export const LAYER_DATA = {
  scientific: {
    label: "True Scale",
    layers: {
      inner: {
        radius: to3D(1221),
        // White Hot Center
        hotColor: "#ffffff",
        coldColor: "#fffec4", // Subtle variation
        noiseScale: 0.8, // Large solid-looking chunks
      },
      outer: {
        radius: to3D(3480),
        // Liquid Amber/Gold
        hotColor: "#ff9900",
        coldColor: "#cc2200",
        noiseScale: 1.5, // Turbulent liquid flow
      },
      mantle: {
        radius: to3D(6335),
        // Viscous Deep Red/Brown
        hotColor: "#b22222",
        coldColor: "#2b0a00",
        noiseScale: 3.5, // Detailed rocky grain
      },
      crust: {
        radius: SCALE_R,
        color: "#1a1a1a",
        displacementScale: 0.015,
      },
    },
  },
  schematic: {
    label: "Diagram Mode",
    layers: {
      inner: {
        radius: 1.3,
        hotColor: "#ffffff",
        coldColor: "#fffec4",
        noiseScale: 0.8,
      },
      outer: {
        radius: 2.4,
        hotColor: "#ff9900",
        coldColor: "#cc2200",
        noiseScale: 1.5,
      },
      mantle: {
        radius: 3.6,
        hotColor: "#b22222",
        coldColor: "#2b0a00",
        noiseScale: 3.5,
      },
      crust: {
        radius: 4.0,
        color: "#1a1a1a",
        displacementScale: 0.08,
      },
    },
  },
};
