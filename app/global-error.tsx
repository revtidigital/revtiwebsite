"use client";

import { useEffect } from "react";

// global-error replaces the root layout, so it must render its own <html>/<body>.
// It only catches errors thrown in the root layout/template.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "1.5rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#4f46e5",
                color: "white",
                fontWeight: 500,
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
