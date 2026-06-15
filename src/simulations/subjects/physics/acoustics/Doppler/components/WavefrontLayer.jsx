//src/simulations/subjects/physics/acoustics/Doppler/components/WavefrontLayer.jsx
import { MAX_DISTANCE, MAX_WAVE_RADIUS } from "../constants";

const WavefrontLayer = ({ sources }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      viewBox={`0 0 ${MAX_DISTANCE} 500`}
      preserveAspectRatio="none"
    >
      {sources.flatMap((source) =>
        (source.waves || []).map((wave) => {
          const opacity = Math.max(0, 0.9 * (1 - wave.r / MAX_WAVE_RADIUS));

          return (
            <circle
              key={wave.id}
              cx={wave.x}
              cy="250"
              r={wave.r}
              fill="none"
              stroke={source.color}
              strokeWidth="3"
              opacity={opacity}
            />
          );
        }),
      )}
    </svg>
  );
};

export default WavefrontLayer;