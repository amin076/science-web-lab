import React from "react";
import { Clouds } from "./Clouds";
import { TectonicPlates } from "./TectonicPlates";
import { AxisArrow } from "./AxisArrow";
import MagneticField from "./MagneticField";
import { Atmosphere } from "./Atmosphere";

export function Overlays({
  settings,
  textures,
  clippingPlanes,
  clipIntersection,
}) {
  return (
    <>
      {settings.showClouds && (
        <Clouds
          map={textures.clouds}
          clippingPlanes={clippingPlanes}
          clipIntersection={clipIntersection}
        />
      )}

      {settings.showTectonics && (
        <TectonicPlates
          map={textures.tectonics}
          clippingPlanes={clippingPlanes}
          clipIntersection={clipIntersection}
        />
      )}

      {settings.showAxis && (
        <AxisArrow color="#ff4040" label="Geo North" length={11} />
      )}

      {settings.showField && <MagneticField />}

      {/* Atmosphere only in full (optional, avoids cut artifacts) */}
      {settings.viewMode === "full" && <Atmosphere />}
    </>
  );
}
