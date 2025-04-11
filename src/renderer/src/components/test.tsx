import React from "react";

interface TestProps {}

function Test() {
  return (
    <div className="clickable">
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
