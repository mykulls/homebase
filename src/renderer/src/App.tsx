import React, { useEffect } from "react";

import { Test, DraggableWrapper } from "./components";
import "./index.css";

const App = () => {
  useEffect(() => {
    // Initially disable mouse events for the whole window
    window.electron?.setIgnoreMouseEvents(true);

    // Clean up when the component unmounts
    return () => {
      window.electron?.setIgnoreMouseEvents(true);
    };
  }, []);

  // Handle mouse entering and leaving the Test component
  const handleMouseEnter = () => {
    window.electron?.setIgnoreMouseEvents(false);
  };

  const handleMouseLeave = () => {
    window.electron?.setIgnoreMouseEvents(true);
  };

  return (
    <div>
      <DraggableWrapper>
        <Test onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
      </DraggableWrapper>
    </div>
  );
};

export default App;
