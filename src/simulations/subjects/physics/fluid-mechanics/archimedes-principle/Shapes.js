import * as THREE from "three";

export const SHAPES = {
  box: "box",
  sphere: "sphere",
  cylinder: "cylinder", // Vertical (Type A)
  cylinderHorizontal: "cylinderHorizontal", // Horizontal (Type B) <--- NEW
  pyramid: "pyramid",
};

export function getShapeData(shape, baseSize = 1.5) {
  const refVolume = Math.pow(baseSize, 3);

  switch (shape) {
    case SHAPES.sphere: {
      const r = Math.cbrt((3 * refVolume) / (4 * Math.PI));
      return {
        type: shape,
        height: r * 2,
        volume: refVolume,
        r: r,
        geometryArgs: [r, 48, 48],
        geometryType: "sphere",
        rotation: [0, 0, 0],
      };
    }
    case SHAPES.cylinder: {
      // Vertical Cylinder
      const h = baseSize;
      const r = Math.sqrt(refVolume / (Math.PI * h));
      return {
        type: shape,
        height: h,
        volume: refVolume,
        r: r,
        geometryArgs: [r, r, h, 32],
        geometryType: "cylinder",
        rotation: [0, 0, 0],
      };
    }
    case SHAPES.cylinderHorizontal: {
      // Horizontal Cylinder (Type B)
      // We want the same volume. Let's make length = baseSize.
      const length = baseSize;
      // V = pi * r^2 * length  =>  r = sqrt(V / (pi * length))
      const r = Math.sqrt(refVolume / (Math.PI * length));

      // IMPORTANT: For physics, the "height" of a horizontal cylinder is its Diameter (2r)
      return {
        type: shape,
        height: r * 2, // The vertical height is the diameter
        volume: refVolume,
        r: r,
        length: length,
        geometryArgs: [r, r, length, 32], // radiusTop, radiusBottom, height(length)
        geometryType: "cylinder",
        rotation: [0, 0, Math.PI / 2], // Rotate 90 degrees to lay flat
      };
    }
    case SHAPES.pyramid: {
      const h = baseSize;
      const r = Math.sqrt((3 * refVolume) / (2 * h));
      return {
        type: shape,
        height: h,
        volume: refVolume,
        r: r,
        geometryArgs: [r, h, 4],
        geometryType: "cone",
        rotation: [0, 0, 0],
      };
    }
    case SHAPES.box:
    default: {
      return {
        type: SHAPES.box,
        height: baseSize,
        volume: refVolume,
        geometryArgs: [baseSize, baseSize, baseSize],
        geometryType: "box",
        rotation: [0, 0, 0],
      };
    }
  }
}

export function calculateSubmergedVolume(shapeData, yPosition, waterLevel) {
  const { type, height, volume, r, length } = shapeData;
  const bottom = yPosition - height / 2;
  const top = yPosition + height / 2;

  if (top <= waterLevel) return volume;
  if (bottom >= waterLevel) return 0;

  const hSub = waterLevel - bottom; // Depth submerged

  switch (type) {
    case SHAPES.box:
    case SHAPES.cylinder: // Vertical
      return volume * (hSub / height);

    case SHAPES.sphere: {
      return (Math.PI * Math.pow(hSub, 2) * (3 * r - hSub)) / 3;
    }

    case SHAPES.cylinderHorizontal: {
      // FORMULA FOR HORIZONTAL CYLINDER
      // Volume = Area of Circular Segment * Length
      // We clamp hSub between 0 and 2r to prevent math errors
      const h = Math.max(0, Math.min(hSub, 2 * r));

      // Calculate Area of Circular Segment
      // A = r^2 * acos((r-h)/r) - (r-h)*sqrt(2rh - h^2)
      const term1 = r * r * Math.acos((r - h) / r);
      const term2 = (r - h) * Math.sqrt(2 * r * h - h * h);
      const areaSegment = term1 - term2;

      return areaSegment * length;
    }

    case SHAPES.pyramid: {
      const hExposed = height - hSub;
      const volExposed = volume * Math.pow(hExposed / height, 3);
      return volume - volExposed;
    }

    default:
      return 0;
  }
}
