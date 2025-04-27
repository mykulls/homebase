import React, { useEffect } from "react";
import { Test, DraggableWrapper } from "./components";
import { SnapContainer } from "./components";
import "./index.css";

const App = () => {
  useEffect(() => {
    window.electron?.setIgnoreMouseEvents(true);
    return () => {
      window.electron?.setIgnoreMouseEvents(true);
    };
  }, []);

  const handleMouseEnter = () => {
    window.electron?.setIgnoreMouseEvents(false);
  };

  const handleMouseLeave = () => {
    window.electron?.setIgnoreMouseEvents(true);
  };

  return (
    <div>
      <SnapContainer>
        {({ position, onPositionChange, onDragStart, onDragEnd, onDimensionsChange }) => (
          <DraggableWrapper
            position={position}
            onPositionChange={onPositionChange}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDimensionsChange={onDimensionsChange} // Pass dimensions handler
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Test />
          </DraggableWrapper>
        )}
      </SnapContainer>
    </div>
  );
};

export default App;
