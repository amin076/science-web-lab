// src/data/experiments/physics/index.js
import { physicsMechanics } from "./mechanics";
import { physicsElectricity } from "./electricity";
import { physicsOptics } from "./optics";
import { physicsWaves } from "./waves";
import { physicsThermo } from "./thermodynamics";
import { physicsChallenges } from "./challenges";
import { physicsFluidMechanics } from "./fluidMechanics";

export const physicsExperiments = [
  ...physicsChallenges,
  ...physicsMechanics,
  ...physicsFluidMechanics,
  ...physicsElectricity,
  ...physicsOptics,
  ...physicsWaves,
  ...physicsThermo,
];
