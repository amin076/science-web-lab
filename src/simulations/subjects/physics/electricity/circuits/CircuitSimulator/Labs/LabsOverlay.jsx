import React from "react";
import CapacitorLab from "../../CapacitorLab";
import ResistorLab from "../../ResistorLab";
import InductorLab from "../../InductorLab";
import LedLab from "../../LedLab";

export default function LabsOverlay({ lab, onClose }) {
  if (!lab) return null;

  if (lab === "capacitor") return <CapacitorLab onClose={onClose} />;
  if (lab === "resistor") return <ResistorLab onClose={onClose} />;
  if (lab === "inductor") return <InductorLab onClose={onClose} />;
  if (lab === "led") return <LedLab onClose={onClose} />;
  return null;
}
