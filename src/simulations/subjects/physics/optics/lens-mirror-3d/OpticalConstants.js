// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalConstants.js

export const VIEW_WIDTH = 1000;
export const VIEW_HEIGHT = 600;

export const ORIGIN_X = VIEW_WIDTH / 2;
export const ORIGIN_Y = VIEW_HEIGHT / 2;

export const PX_PER_CM = 1.5;

export const ELEMENT_HALF_HEIGHT_CM = 65;
export const LENS_WIDTH_CM = 10;
export const LENS_CENTER_THICKNESS_CM = 3;

// The depth of the mirror curve in cm
export const MIRROR_SAG_CM = 10;

export const MAX_OBJ_HEIGHT = ELEMENT_HALF_HEIGHT_CM - 2;

export const COLOR_RAY_1 = "#ff4b4b";
export const COLOR_RAY_2 = "#5eead4";

export const cmToPx = (cm) => cm * PX_PER_CM;
