import React, { useEffect, useState } from "react";
import { Test, DraggableWrapper, SnapContainer, ExpandCollapseButton } from "./components";
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
        position={{ x: -30, y: window.innerHeight - 60 }} // Bottom-left corner
        onPositionChange={() => {}} // No-op since it's not draggable
        onDragStart={() => {}}
        onDragEnd={() => {}}
        onDimensionsChange={() => {}}
        draggable={false} // Make the button non-draggable
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ExpandCollapseButton collapsed={collapsed} toggleCollapse={toggleCollapse} />
      </DraggableWrapper>

      {/* Other Draggable Windows */}
      <div
        style={{
          opacity: collapsed ? 0 : 1, // Animate opacity
          transition: "opacity 0.2s ease", // Smooth transition
          pointerEvents: collapsed ? "none" : "auto", // Disable interaction when collapsed
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
              onDimensionsChange={onDimensionsChange} // Pass dimensions handler
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
