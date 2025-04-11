import React from "react";

interface TestProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function Test({ onMouseEnter, onMouseLeave }: TestProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="clickable"
      style={{
        width: "600px",
        height: "400px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ccc",
        borderRadius: "12px",
        margin: "50px auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        pointerEvents: "auto",
      }}
    >
      <button
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={() => {
          // No action yet
        }}
      >
        Sign In
      </button>
    </div>
  );
}

export default Test;
