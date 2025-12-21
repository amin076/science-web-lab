import React from "react";
import { useNavigate } from "react-router-dom";
import { SimulationErrorBoundary } from "./SimulationErrorBoundary";

export default function SimulationBoundary({ children }) {
  const navigate = useNavigate();

  return (
    <SimulationErrorBoundary
      onBackToExperiments={() => navigate("/experiments")}
    >
      {children}
    </SimulationErrorBoundary>
  );
}
