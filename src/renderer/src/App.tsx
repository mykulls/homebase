import React, { useEffect, useState } from "react";
import { Test, DraggableWrapper, SnapContainer } from "./components";
import "./index.css";

const App = () => {
  const [collapsed, setCollapsed] = useState(false); // State to track if windows are collapsed

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

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev); // Toggle the collapsed state
  };

  return (
    <div>
      {/* Expand/Collapse Button */}
      <DraggableWrapper
        position={{ x: 20, y: window.innerHeight - 60 }} // Bottom-left corner
        draggable={false} // Make the button non-draggable
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={toggleCollapse}
          style={{
            width: "100px",
            height: "40px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </DraggableWrapper>

      {/* Other Draggable Windows */}
      <div
        style={{
          opacity: collapsed ? 0 : 1, // Animate opacity
          transition: "opacity 0.2s ease", // Smooth transition
        }}
      >
        <SnapContainer>
          {({ position, onPositionChange, onDragStart, onDragEnd, onDimensionsChange }) => (
            <DraggableWrapper
              collapsed={collapsed}
              position={position}
              onPositionChange={onPositionChange}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDimensionsChange={onDimensionsChange}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Test />
            </DraggableWrapper>
          )}
        </SnapContainer>
      </div>
    </div>
  );
};

export default App;
