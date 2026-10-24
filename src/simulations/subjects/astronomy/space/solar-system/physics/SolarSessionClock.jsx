import {createContext,useContext} from "react";
import {useFrame} from "@react-three/fiber";
export const SolarSessionClock=createContext(null);
export function SolarClockDriver({clock,remote,running,speed}){
  useFrame((_,delta)=>{if(!remote&&running){clock.current.elapsedSeconds+=delta;clock.current.phaseSeconds+=delta*speed;}},-1);
  return null;
}
export function useSolarSessionClock(){return useContext(SolarSessionClock);}
