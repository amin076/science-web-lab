import React from "react";

export class SimulationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("SimulationErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          paddingTop: "calc(var(--esbiko-safe-top, 0px) + 24px)",
          paddingRight: "calc(var(--esbiko-safe-right, 0px) + 24px)",
          paddingBottom: "calc(var(--esbiko-safe-bottom, 0px) + 24px)",
          paddingLeft: "calc(var(--esbiko-safe-left, 0px) + 24px)",
          background: "linear-gradient(135deg,#050510,#1a1a2e)",
          color: "white",
          textAlign: "center",
          overflowX: "hidden",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 26, marginBottom: 10 }}>Simulation crashed</h1>
          <p style={{ opacity: 0.8, marginBottom: 18 }}>
            This simulation encountered an error. You can go back to the
            experiments list safely.
          </p>

          <button
            onClick={this.props.onBackToExperiments}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.12)",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              width: "100%",
            }}
          >
            🏠 Back to Experiments
          </button>
        </div>
      </div>
    );
  }
}
