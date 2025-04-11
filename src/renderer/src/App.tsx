import React, { useEffect } from "react";
import { ipcRenderer } from "electron";
import Test from "./test";

const App = () => {
  useEffect(() => {
    // Initially disable mouse events for the whole window
    ipcRenderer.send("set-ignore-mouse-events", true);

    // Clean up when the component unmounts
    return () => {
      ipcRenderer.send("set-ignore-mouse-events", true); // Ensure mouse events are disabled when leaving
    };
  }, []);

  // Handle mouse entering and leaving the Test component
  const handleMouseEnter = () => {
    ipcRenderer.send("set-ignore-mouse-events", false); // Enable mouse events when entering Test component
  };

  const handleMouseLeave = () => {
    ipcRenderer.send("set-ignore-mouse-events", true); // Disable mouse events when leaving Test component
  };

  return (
    <div>
      <Test onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
    </div>
  );
};

export default App;
