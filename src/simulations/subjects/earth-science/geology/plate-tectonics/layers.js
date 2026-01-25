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
        // Mercury texture is grey, we tint it slightly warm yellow
        color: "#fffae0", 
        emissive: "#886600",
        intensity: 0.5,
      },
      outer: {
        radius: to3D(3480),
        // Sun texture is already orange/bright, so we keep color white to show texture
        color: "#ffffff", 
        emissive: "#aa3300",
        intensity: 1.0, // High glow for liquid metal
      },
      mantle: {
        radius: to3D(6335),
        // Mars texture is red, we darken it for rocky mantle
        color: "#8b3a3a", 
        emissive: "#421010",
        intensity: 0.2,
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
        color: "#fffae0",
        emissive: "#886600",
        intensity: 0.5,
      },
      outer: {
        radius: 2.4,
        color: "#ffffff",
        emissive: "#aa3300",
        intensity: 1.0,
      },
      mantle: {
        radius: 3.6,
        color: "#8b3a3a",
        emissive: "#421010",
        intensity: 0.2,
      },
      crust: {
        radius: 4.0,
        color: "#1a1a1a",
        displacementScale: 0.08,
      },
    },
  },
};
