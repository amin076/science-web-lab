// src/data/experiments/physics/index.js
import { physicsMechanics } from "./mechanics";
import { physicsElectricity } from "./electricity";
import { physicsOptics } from "./optics";
import { physicsWaves } from "./waves";
import { physicsThermo } from "./thermodynamics";

export const physicsExperiments = [
  ...physicsMechanics,
  ...physicsElectricity,
  ...physicsOptics,
  ...physicsWaves,
  ...physicsThermo,
];
