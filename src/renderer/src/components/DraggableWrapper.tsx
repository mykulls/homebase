import React, { useState, useRef, useEffect } from "react";
import "./DraggableWrapper.css";

interface DraggableWrapperProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  draggable?: boolean;
  collapsed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDimensionsChange?: (final: boolean, dimensions: { width: number; height: number }) => void;
  dimensions?: { width: number; height: number };
  isEditMode?: boolean;
  onDelete?: () => void;
}

function DraggableWrapper({
  children,
  position,
  draggable = true,
  collapsed = false,
  onMouseEnter = () => {},
  onMouseLeave = () => {},
  onPositionChange = () => {},
  onDragStart = () => {},
  onDragEnd = () => {},
  onDimensionsChange = () => {},
  dimensions = { width: 0, height: 0 },
  isEditMode = false,
  onDelete = () => {},
}: DraggableWrapperProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (collapsed) {
    draggable = false;
    onMouseEnter = () => {};
    onMouseLeave = () => {};
    onPositionChange = () => {};
    onDragStart = () => {};
    onDragEnd = () => {};
    onDimensionsChange = () => {};
    onDelete = () => {};
  }

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!resizing || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const newHeight = Math.max(100, e.clientY - rect.top);
      onDimensionsChange(false, { width: dimensions.width, height: newHeight });
    };

    const handleResizeEnd = () => {
      if (resizing) {
        setResizing(false);

        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          const newHeight = rect.height;

          onDimensionsChange(true, { width: dimensions.width, height: newHeight });
        }
      }
    };

    if (resizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizing, onDimensionsChange, onPositionChange, dimensions.width]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable || !isEditMode) return; // Prevent dragging if not draggable

    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();

    const isFormElement = ["input", "textarea", "button", "select"].includes(tag);
    if (isFormElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragging(true);
    onDragStart();
    e.stopPropagation();
    e.preventDefault();
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setResizing(true);
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={wrapperRef}
      className="draggable"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        userSelect: "none",
        cursor: dragging ? "grabbing" : draggable && isEditMode ? "grab" : "default",
        background:
          !draggable || dragging || resizing
            ? "linear-gradient(69deg, rgba(128, 128, 128, 0.69) 52%, rgba(128, 128, 128, 0.42) 97%)"
            : "linear-gradient(69deg, rgba(128, 128, 128, 0.69) 12%, rgba(128, 128, 128, 0.42) 77%)",
        // reduce transparency when dragging
        transition: dragging || resizing ? "none" : "all 0.2s ease-out",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => {
        if (dragging) {
          onPositionChange({
            x: e.clientX - offsetRef.current.x,
            y: e.clientY - offsetRef.current.y,
          });
        }
      }}
      onMouseUp={() => {
        if (dragging) {
          setDragging(false);
          onDragEnd();
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isEditMode && draggable && !collapsed && (
        <div className="delete-button-container">
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            -
          </button>
        </div>
      )}

      {children}

      {isEditMode && draggable && !collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: "16px",
            height: "16px",
            cursor: "nwse-resize",
            borderRight: "6px solid rgba(255, 255, 255, 0.69)",
            borderBottom: "6px solid rgba(255, 255, 255, 0.69)",
            borderRadius: "4px",
            zIndex: 1,
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}

export default DraggableWrapper;
