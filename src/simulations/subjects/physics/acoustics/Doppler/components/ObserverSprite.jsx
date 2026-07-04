// src/simulations/subjects/physics/acoustics/Doppler/components/ObserverSprite.jsx
import { MAX_DISTANCE } from "../constants";

const ObserverSprite = ({ observer }) => {
  return (
    <div
      className="absolute z-30 will-change-transform"
      style={{
        left: `${(observer.x / MAX_DISTANCE) * 100}%`,
        top: "80%",
        transform: "translate(-55%, -100%)",
      }}
    >
      <img
        src="/models/doppler/girl.png"
        alt="Listener"
        draggable="false"
        className="w-[120px] h-[250px] object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
};

export default ObserverSprite;
