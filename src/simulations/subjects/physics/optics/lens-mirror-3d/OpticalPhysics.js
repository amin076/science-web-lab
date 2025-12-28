// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalPhysics.js

export const calculateOpticalElement = (
  type,
  focalLength,
  objDistance,
  objHeight
) => {
  // --- 1. Sign Convention ---
  // Converging Systems (Convex Lens, Concave Mirror): f is POSITIVE
  // Diverging Systems (Concave Lens, Convex Mirror): f is NEGATIVE

  let fSign = 1;
  if (type === "concave-lens" || type === "convex-mirror") {
    fSign = -1;
  }

  const fAbs = Math.abs(focalLength);
  const f = fAbs * fSign;

  const do_ = Math.abs(objDistance);
  const ho = objHeight;

  // --- 2. Thin Lens/Mirror Equation ---
  // 1/f = 1/do + 1/di  =>  1/di = 1/f - 1/do
  const val = 1 / f - 1 / do_;

  let di;
  // Handle infinity (object at focus)
  if (Math.abs(val) < 0.0001) {
    di = 10000;
  } else {
    di = 1 / val;
  }

  // --- 3. Magnification ---
  // m = -di / do
  const m = -di / do_;
  const hi = m * ho;

  const isMirror = type.includes("mirror");

  // --- 4. Image Properties ---
  // If di is POSITIVE: Real Image.
  // If di is NEGATIVE: Virtual Image.
  const isReal = di > 0;

  return {
    type,
    f,
    do: do_,
    di, // Image Distance (Positive = Real, Negative = Virtual)
    m, // Magnification
    ho, // Object Height
    hi, // Image Height (Negative = Inverted)
    isReal,
    isMirror,
  };
};
