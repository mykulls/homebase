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
  [key in Corner]: number;
};

type WidgetInfo = {
  type: WidgetType;
  id: number;
  startCorner: Corner;
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [corners, setCorners] = useState<CornerMap>({
    [Corner.TopLeft]: -1,
    [Corner.TopRight]: -1,
    [Corner.BottomLeft]: -1,
    [Corner.BottomRight]: -1,
  });
  const [widgets, setWidgets] = useState<WidgetInfo[]>([]);
  const [swapCorner, setSwapCorner] = useState<Corner | null>(null);
  const [swapWidget, setSwapWidget] = useState<number | null>(null); // widget id of the widget being swapped

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
    setCollapsed((prev) => !prev);
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const cornerOccupied = (corner: Corner) => {
    return corners[corner] !== -1;
  };

  const getNextAvailableCorner = () => {
    const cornerOrder = [Corner.TopLeft, Corner.TopRight, Corner.BottomRight, Corner.BottomLeft];
    return cornerOrder.find((corner) => !cornerOccupied(corner)) || null;
  };

  const getNextAvailableId = () => {
    for (let i = 0; i < 4; i++) {
      if (widgets.find((w) => w.id === i) === undefined) {
        return i;
      }
    }

    return -1;
  };

  const onDragEnd = (currentCorner: Corner, nextCorner: Corner) => {
    if (currentCorner === nextCorner) return;

    const widgetId = corners[currentCorner];
    if (widgetId === -1) return;
    if (cornerOccupied(nextCorner)) {
      const otherWidgetId = corners[nextCorner];
      setCorners((prev) => ({
        ...prev,
        [currentCorner]: otherWidgetId,
        [nextCorner]: widgetId,
      }));
      setSwapWidget(otherWidgetId);
      setSwapCorner(currentCorner);
    } else {
      setCorners((prev) => ({
        ...prev,
        [currentCorner]: -1,
        [nextCorner]: widgetId,
      }));
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    const availableCorner = getNextAvailableCorner();
    const availableId = getNextAvailableId();
    if (availableCorner && availableId !== -1) {
      setCorners((prev) => ({
        ...prev,
        [availableCorner]: availableId,
      }));
      setWidgets((prev) => [...prev, { type, id: availableId, startCorner: availableCorner }]);
    } else {
      alert("All corners are occupied! Remove a widget to add a new one.");
    }
  };

  const handleDeleteWidget = (corner: Corner) => {
    const widgetId = corners[corner];
    setCorners((prev) => ({
      ...prev,
      [corner]: -1,
    }));
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(newWidgets);
  };

  return (
    <div>
      <div
        style={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <DraggableWrapper
          position={{ x: window.innerWidth - 20, y: window.innerHeight - 100 }}
          draggable={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AddButton onAddWidget={handleAddWidget} />
        </DraggableWrapper>
      </div>

      <DraggableWrapper
        position={{ x: -30, y: window.innerHeight - 60 }}
        draggable={false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ExpandCollapseButton collapsed={collapsed} toggleCollapse={toggleCollapse} />
      </DraggableWrapper>

      <div
        style={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <DraggableWrapper
          collapsed={collapsed}
          position={{ x: window.innerWidth - 20, y: window.innerHeight - 60 }}
          draggable={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <EditButton isEditMode={editMode} toggleEditMode={toggleEditMode} />
        </DraggableWrapper>
      </div>

      <div
        style={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        {widgets.map((widget) => {
          return (
            <SnapContainer
              key={`${widget.id}`}
              newCorner={swapWidget !== null && swapWidget === widget.id ? swapCorner : null}
              nullNewCorner={() => {
                setSwapCorner(null);
                setSwapWidget(null);
              }}
              startCorner={widget.startCorner}
              onDragEnd={onDragEnd}
              onDelete={handleDeleteWidget}
              cornerOccupied={cornerOccupied}
            >
              {(props) => (
                <DraggableWrapper
                  collapsed={collapsed}
                  {...props}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  isEditMode={editMode}
                >
                  <Widget audioOnly={props.widgetSize > 0} type={widget.type} />
                </DraggableWrapper>
              )}
            </SnapContainer>
          );
        })}
      </div>
    </div>
  );
};

export default App;
