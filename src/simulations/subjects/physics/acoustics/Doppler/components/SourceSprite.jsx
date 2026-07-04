// src/simulations/subjects/physics/acoustics/Doppler/components/SourceSprite.jsx

import { ArrowRight } from "lucide-react";
import { MAX_DISTANCE } from "../constants";

const CAR_SCALE = 1.9;

const BASE_CAR_WIDTH = 300;
const BASE_CAR_HEIGHT = 140;

const BASE_WHEEL_SIZE = 16;
const BASE_FRONT_WHEEL_X = 105;
const BASE_REAR_WHEEL_X = 190;
const BASE_WHEEL_Y = 90;

const CAR_WIDTH = BASE_CAR_WIDTH * CAR_SCALE;
const CAR_HEIGHT = BASE_CAR_HEIGHT * CAR_SCALE;

const WHEEL_SIZE = BASE_WHEEL_SIZE * CAR_SCALE;
const FRONT_WHEEL_X = BASE_FRONT_WHEEL_X * CAR_SCALE;
const REAR_WHEEL_X = BASE_REAR_WHEEL_X * CAR_SCALE;
const WHEEL_Y = BASE_WHEEL_Y * CAR_SCALE;

const SourceSprite = ({ source }) => {
  const wheelSpeed = Math.max(
    0.2,
    1.2 - Math.min(Math.abs(source.v || 0), 150) / 180,
  );

  return (
    <div
      className="absolute z-30 will-change-transform"
      style={{
        left: `${(source.x / MAX_DISTANCE) * 100}%`,
        top: "80%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="relative"
        style={{
          width: `${CAR_WIDTH}px`,
          height: `${CAR_HEIGHT}px`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: source.v < 0 ? "scaleX(-1)" : "none",
          }}
        >
          <img
            src="/models/doppler/car.png"
            alt="Sound source car"
            draggable="false"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.5)]"
          />

          <Wheel x={FRONT_WHEEL_X} y={WHEEL_Y} speed={wheelSpeed} />
          <Wheel x={REAR_WHEEL_X} y={WHEEL_Y} speed={wheelSpeed} />
        </div>
      </div>

      <style>{`
        @keyframes dopplerWheelSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const Wheel = ({ x, y, speed }) => (
  <div
    className="absolute z-20 rounded-full border-2 border-white/80 bg-slate-950/20"
    style={{
      left: `${x}px`,
      top: `${y}px`,
      width: `${WHEEL_SIZE}px`,
      height: `${WHEEL_SIZE}px`,
      animation: `dopplerWheelSpin ${speed}s linear infinite`,
      transform: "translate(-50%, -50%)",
      boxShadow: "0 0 6px rgba(255,255,255,0.3)",
    }}
  >
    <div
      className="absolute left-1/2 top-1/2 bg-white/70"
      style={{
        width: `${2 * CAR_SCALE}px`,
        height: `${16 * CAR_SCALE}px`,
        transform: "translate(-50%, -50%)",
      }}
    />

    <div
      className="absolute left-1/2 top-1/2 bg-white/70"
      style={{
        height: `${2 * CAR_SCALE}px`,
        width: `${16 * CAR_SCALE}px`,
        transform: "translate(-50%, -50%)",
      }}
    />

    <div
      className="absolute left-1/2 top-1/2 rounded-full bg-white/90"
      style={{
        width: `${5 * CAR_SCALE}px`,
        height: `${5 * CAR_SCALE}px`,
        transform: "translate(-50%, -50%)",
      }}
    />
  </div>
);

export default SourceSprite;
