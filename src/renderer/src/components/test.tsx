import React from "react";

interface TestProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function Test({ onMouseEnter, onMouseLeave }: TestProps) {
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="clickable">
      <button
        className="sign-in"
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
