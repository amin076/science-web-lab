// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalPhysics.js

export const calculateOpticalElement = (type, focalLength, objDistance, objHeight) => {
  // Sign Convention:
  // Converging (Concave Mirror, Convex Lens) = +f
  // Diverging (Convex Mirror, Concave Lens) = -f
  
  let fSign = 1;
  if (type === 'concave-lens' || type === 'convex-mirror') {
    fSign = -1;
  }
  
  const fAbs = Math.abs(focalLength);
  const f = fAbs * fSign;
  
  const do_ = Math.abs(objDistance);
  const ho = objHeight;

  // Thin Lens/Mirror Equation: 1/di = 1/f - 1/do
  const val = (1 / f) - (1 / do_);
  
  let di;
  if (Math.abs(val) < 0.0001) {
    di = 10000; // Infinity
  } else {
    di = 1 / val;
  }

  // Magnification: m = -di / do
  const m = -di / do_;
  const hi = m * ho;

  const isMirror = type.includes('mirror');
  
  // Real Image Rule:
  // For single element, di > 0 implies Real Image.
  const isReal = di > 0;

  return {
    type,
    f, 
    do: do_,
    di,
    m,
    ho,
    hi,
    isReal,
    isMirror
  };
};