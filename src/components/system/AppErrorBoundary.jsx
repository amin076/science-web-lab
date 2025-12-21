import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log to monitoring later (Sentry, etc.)
    console.error("AppErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "linear-gradient(135deg,#0f172a,#111827)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.8, marginBottom: 18 }}>
            The app encountered an unexpected error. You can safely go back to
            the experiments list.
          </p>

          <button
            onClick={() => (window.location.href = "/experiments")}
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

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 10,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              width: "100%",
              opacity: 0.9,
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
