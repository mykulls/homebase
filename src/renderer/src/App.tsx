import React, { useEffect, useState, JSX, useMemo } from "react";
import {
  Widget,
  DraggableWrapper,
  SnapContainer,
  ExpandCollapseButton,
  EditButton,
  AddButton,
  WidgetType,
  Corner,
} from "./components";
import "./index.css";

type CornerMap = {
  [key in Corner]: WidgetType;
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [corners, setCorners] = useState<CornerMap>({
    [Corner.TopLeft]: WidgetType.None,
    [Corner.TopRight]: WidgetType.None,
    [Corner.BottomLeft]: WidgetType.None,
    [Corner.BottomRight]: WidgetType.None,
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

  const cornerOccupied = (corner: Corner) => {
    return corners[corner] !== WidgetType.None;
  };

  const onDragEnd = (currentCorner: Corner, nextCorner: Corner) => {
    if (currentCorner === nextCorner) return;

    const widget = corners[currentCorner];

    if (widget === WidgetType.None) return;
    setCorners((prev) => ({
      ...prev,
      [currentCorner]: WidgetType.None,
      [nextCorner]: widget,
    }));
  };
  const handleAddWidget = (type: WidgetType) => {
    const availableCorner = Object.values(Corner).find((corner) => !cornerOccupied(corner));
    if (availableCorner) {
      setCorners((prev) => ({
        ...prev,
        [availableCorner]: type,
      }));
    } else {
      alert("All corners are occupied! Remove a widget to add a new one.");
    }
  };

  const handleDeleteWidget = (corner: Corner) => {
    setCorners((prev) => ({
      ...prev,
      [corner]: WidgetType.None,
    }));
  };

  // Create memoized widgets that update when relevant props change
  const memoizedWidgets = useMemo(() => {
    return Object.entries(corners)
      .map(([corner, type]) => {
        if (type === WidgetType.None) return null;

        return (
          <SnapContainer
            key={`${type}-${corner}`}
            startCorner={corner as Corner}
            onDragEnd={onDragEnd}
            onDelete={handleDeleteWidget}
            cornerOccupied={cornerOccupied}
          >
            {({
              position,
              onPositionChange,
              onDragStart,
              onDragEnd,
              onDimensionsChange,
              onDelete,
              dimensions,
              widgetSize,
            }) => (
              <DraggableWrapper
                collapsed={collapsed}
                position={position}
                onPositionChange={onPositionChange}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDimensionsChange={onDimensionsChange}
                dimensions={dimensions}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                isEditMode={editMode}
                onDelete={onDelete}
              >
                <Widget audioOnly={widgetSize > 0} type={type} />
              </DraggableWrapper>
            )}
          </SnapContainer>
        );
      })
      .filter(Boolean);
  }, [corners, collapsed, editMode, onDragEnd, handleDeleteWidget, cornerOccupied, handleMouseEnter, handleMouseLeave]);

  return (
    <div>
      <DraggableWrapper
        position={{ x: window.innerWidth - 20, y: window.innerHeight - 100 }} // Bottom-left corner
        draggable={false} // Make the button non-draggable
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AddButton onAddWidget={handleAddWidget} />
      </DraggableWrapper>

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
        {memoizedWidgets}
      </div>
    </div>
  );
};

export default App;
