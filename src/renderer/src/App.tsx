import React, { useEffect, useState } from "react";
import {
  Widget,
  DraggableWrapper,
  SnapContainer,
  ExpandCollapseButton,
  EditButton,
  WidgetType,
  Corner,
} from "./components";
import "./index.css";

enum WidgetState {
  None,
  Exists,
}

const App = () => {
  const [collapsed, setCollapsed] = useState(false); // State to track if windows are collapsed
  const [editMode, setEditMode] = useState(false);
  const [widgets, setWidgets] = useState({
    [Corner.TopLeft]: WidgetState.None,
    [Corner.TopRight]: WidgetState.None,
    [Corner.BottomRight]: WidgetState.None,
    [Corner.BottomLeft]: WidgetState.None,
  });

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

  const toggleEditMode = () => {
    setEditMode((prev) => !prev); // Toggle the edit mode
  };

  const initCorner = (corner: Corner) => {
    setWidgets((prev) => ({
      ...prev,
      [corner]: WidgetState.Exists,
    }));
  };

  const cornerOccupied = (corner: Corner) => {
    return widgets[corner] === WidgetState.Exists;
  };

  const onDragEnd = (corner: Corner, nextCorner: Corner) => {
    if (corner === nextCorner) return;
    setWidgets((prev) => ({
      ...prev,
      [corner]: WidgetState.None,
      [nextCorner]: WidgetState.Exists,
    }));
  };

  return (
    <div>
      {/* Expand/Collapse Button */}
      <DraggableWrapper
        position={{ x: -30, y: window.innerHeight - 60 }} // Bottom-left corner
        draggable={false} // Make the button non-draggable
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ExpandCollapseButton collapsed={collapsed} toggleCollapse={toggleCollapse} />
      </DraggableWrapper>

      <div
        style={{
          opacity: collapsed ? 0 : 1, // Animate opacity
          transition: "opacity 0.2s ease", // Smooth transition
          pointerEvents: collapsed ? "none" : "auto", // Disable interaction when collapsed
        }}
      >
        <DraggableWrapper
          collapsed={collapsed}
          position={{ x: window.innerWidth - 20, y: window.innerHeight - 60 }} // Bottom-left corner
          draggable={false} // Make the button non-draggable
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <EditButton isEditMode={editMode} toggleEditMode={toggleEditMode} />
        </DraggableWrapper>
      </div>
      <div
        style={{
          opacity: collapsed ? 0 : 1, // Animate opacity
          transition: "opacity 0.2s ease", // Smooth transition
          pointerEvents: collapsed ? "none" : "auto", // Disable interaction when collapsed
        }}
      >
        <SnapContainer
          startCorner={Corner.TopLeft}
          initCorner={initCorner}
          onDragEnd={onDragEnd}
          cornerOccupied={cornerOccupied}
        >
          {({ position, onPositionChange, onDragStart, onDragEnd, onDimensionsChange, dimensions, widgetSize }) => (
            <DraggableWrapper
              collapsed={collapsed}
              position={position}
              onPositionChange={onPositionChange}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDimensionsChange={onDimensionsChange} // Pass dimensions handler
              dimensions={dimensions}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isEditMode={editMode}
            >
              <Widget audioOnly={widgetSize > 0} type={WidgetType.Youtube} />
            </DraggableWrapper>
          )}
        </SnapContainer>
        <SnapContainer
          startCorner={Corner.TopRight}
          initCorner={initCorner}
          onDragEnd={onDragEnd}
          cornerOccupied={cornerOccupied}
        >
          {({ position, onPositionChange, onDragStart, onDragEnd, onDimensionsChange, dimensions, widgetSize }) => (
            <DraggableWrapper
              collapsed={collapsed}
              position={position}
              onPositionChange={onPositionChange}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDimensionsChange={onDimensionsChange} // Pass dimensions handler
              dimensions={dimensions}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isEditMode={editMode}
            >
              <Widget audioOnly={widgetSize > 0} type={WidgetType.Spotify} />
            </DraggableWrapper>
          )}
        </SnapContainer>
      </div>
    </div>
  );
};

export default App;
