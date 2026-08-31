import React from "react";
import XRSurfacePlacement from "../../../../../../../components/xr/XRSurfacePlacement";

/**
 * Solar System compatibility wrapper.
 *
 * The generic placement implementation now lives in src/components/xr so
 * other simulations can use the same AR runtime without copying Solar code.
 */
export default function ARRoomPlacement({
  children,
  enabled,
  roomScale = 0.035,
}) {
  return (
    <XRSurfacePlacement
      enabled={enabled}
      initialScale={roomScale}
      readyMessage="Tap to place the Solar System"
    >
      {children}
    </XRSurfacePlacement>
  );
}
