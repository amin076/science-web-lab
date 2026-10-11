import { useEffect, useRef } from "react";
import { mountCompoundPendulumAdmin } from "./compoundPendulumHtmlView.js";

/** Protected admin host. All controls/rendering/physics use the non-React HTML runtime. */
export default function CompoundPendulumAdmin() {
  const host = useRef(null);
  useEffect(() => {
    const instance = mountCompoundPendulumAdmin(host.current);
    return () => instance.dispose();
  }, []);
  return <div ref={host} aria-label="Compound Pendulum administration preview" />;
}
