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
  const [resizing, setResizing] = useState(false); // Track resizing state
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
      const newHeight = Math.max(100, e.clientY - rect.top); // Minimum height of 100px

      onDimensionsChange(false, { width: rect.width, height: newHeight });
    };

    const handleResizeEnd = () => {
      if (resizing) {
        setResizing(false);

        // Snap height to the closest option (half height or full height)
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          onDimensionsChange(true, { width: rect.width, height: rect.height });
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
  }, [resizing, onDimensionsChange]);

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
    onDragStart(); // Notify SnapContainer that dragging has started
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
      ref={wrapperRef} // Attach ref to the wrapper
      className="draggable"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: `${dimensions.width}px`, // Use dynamic width
        height: `${dimensions.height}px`, // Use dynamic height
        userSelect: "none",
        cursor: dragging ? "grabbing" : draggable && isEditMode ? "grab" : "default",
        background:
          !draggable || dragging || resizing
            ? "linear-gradient(69deg, rgba(255, 255, 255, 0.25) 52%, rgba(255, 255, 255, 0.1) 97%)"
            : "linear-gradient(69deg, rgba(255, 255, 255, 0.25) 12%, rgba(255, 255, 255, 0.1) 77%)",
        // reducve transparency when dragging
        transition: dragging || resizing ? "none" : "all 0.2s ease-out", // Smooth snapping
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
          onDragEnd(); // Notify SnapContainer that dragging has ended
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isEditMode && draggable && !collapsed && (
        <div
          style={{
            position: "absolute",
            top: -3,
            left: -3,
            width: "24px",
            height: "24px",
            cursor: "pointer",
            background: "#dc3545",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          ×
        </div>
      )}

      {children}

      {isEditMode && draggable && !collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: "16px",
            height: "16px",
            cursor: "nwse-resize",
            borderRight: "6px solid grey",
            borderBottom: "6px solid grey",
            borderRadius: "3px",
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}

export default DraggableWrapper;
