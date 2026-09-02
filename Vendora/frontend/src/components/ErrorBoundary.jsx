import React from "react";

/**
 * Catches render errors in child components and shows a friendly fallback
 * instead of a blank screen. A "Reload" action is offered.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Vendora UI error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            background: "#f6f6f5",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#475569", marginTop: 8, maxWidth: 420 }}>
            An unexpected error occurred while rendering this page. Please reload
            to continue.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
