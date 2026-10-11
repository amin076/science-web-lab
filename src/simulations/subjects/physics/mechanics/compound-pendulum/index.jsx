import {useEffect,useRef} from "react";
import {mountCompoundComparison} from "./ComparisonView.js";
export default function CompoundPendulum(){
  const host=useRef(null);
  useEffect(()=>{
    const mounted=mountCompoundComparison(host.current);
    return ()=>mounted.dispose();
  },[]);
  return <div ref={host} aria-label="Compound Pendulum comparison simulation" />;
}
