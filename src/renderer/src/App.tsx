import React, { useEffect, useState } from "react";
import {
  Widget,
  DraggableWrapper,
  SnapContainer,
  ExpandCollapseButton,
  EditButton,
  AddButton,
  WidgetType,
} from "./components";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type WidgetInfo = {
  type: WidgetType;
  id: number;
  startBox: number;
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [boxes, setBoxes] = useState<number[]>(Array(3).fill(-1)); // -1 means empty, otherwise it holds widget id
  const [widgets, setWidgets] = useState<WidgetInfo[]>([]);
  const [swapBox, setSwapBox] = useState<number | null>(null);
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

  const boxOccupied = (box: number) => {
    return boxes[box] !== -1;
  };

  const getNextAvailableBox = () => {
    const nextBox = boxes.findIndex((box) => box === -1);

    return nextBox !== -1 ? nextBox : null;
  };

  const getNextAvailableId = () => {
    for (let i = 0; i < 3; i++) {
      if (widgets.find((w) => w.id === i) === undefined) {
        return i;
      }
    }

    return -1;
  };

  const onDragEnd = (currentBox: number, nextBox: number) => {
    if (currentBox === nextBox) return;

    const widgetId = boxes[currentBox];
    if (widgetId === -1) return;

    if (boxOccupied(nextBox)) {
      const otherWidgetId = boxes[nextBox];
      const nextBoxes = boxes;
      nextBoxes[currentBox] = otherWidgetId;
      nextBoxes[nextBox] = widgetId;
      setBoxes(nextBoxes);
      setSwapWidget(otherWidgetId);
      setSwapBox(currentBox);
    } else {
      const nextBoxes = boxes;
      nextBoxes[currentBox] = -1;
      nextBoxes[nextBox] = widgetId;
      setBoxes(nextBoxes);
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    const availableBox = getNextAvailableBox();
    const availableId = getNextAvailableId();
    console.log("Available Box:", availableBox, "Available ID:", availableId);
    console.log(boxes);
    if (availableBox !== null && availableId !== -1) {
      const nextBoxes = boxes;
      nextBoxes[availableBox] = availableId;
      setBoxes(nextBoxes);
      setWidgets((prev) => [...prev, { type, id: availableId, startBox: availableBox }]);
    } else {
      alert("All positions are occupied! Remove a widget to add a new one.");
    }
  };

  const handleDeleteWidget = (box: number) => {
    const widgetId = boxes[box];
    const nextBoxes = boxes;
    nextBoxes[box] = -1;
    setBoxes(nextBoxes);
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
          position={{ x: 120, y: 20 }}
          draggable={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          dimensions={{ width: 50, height: 50 }}
        >
          <AddButton onAddWidget={handleAddWidget} />
        </DraggableWrapper>
      </div>

      <div
        style={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <DraggableWrapper
          collapsed={collapsed}
          position={{ x: 50, y: 20 }}
          draggable={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          dimensions={{ width: 50, height: 50 }}
        >
          <EditButton isEditMode={editMode} toggleEditMode={toggleEditMode} />
        </DraggableWrapper>
      </div>

      <div className="expand-collapse-button-wrapper">
        <DraggableWrapper
          position={{ x: -40, y: 20 }}
          draggable={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          dimensions={{ width: 60, height: 50 }}
        >
          <ExpandCollapseButton collapsed={collapsed} toggleCollapse={toggleCollapse} />
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
              newBox={swapWidget !== null && swapWidget === widget.id ? swapBox : null}
              nullNewBox={() => {
                setSwapBox(null);
                setSwapWidget(null);
              }}
              startBox={widget.startBox}
              onDragEnd={onDragEnd}
              onDelete={handleDeleteWidget}
              boxOccupied={boxOccupied}
            >
              {(props) => (
                <DraggableWrapper
                  collapsed={collapsed}
                  {...props}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  isEditMode={editMode}
                >
                  <Widget type={widget.type} />
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
