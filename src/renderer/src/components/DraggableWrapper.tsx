import React, { useState, useRef, useEffect } from "react";
import "./DraggableWrapper.css";
import { Corner } from "./SnapContainer";

interface DraggableWrapperProps {
  children: React.ReactNode;
  bottom: boolean;
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
  bottom,
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
  const initialBottomRef = useRef<number>(0); // Add this new ref

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

      if (bottom) {
        // Use the stored initial bottom position instead of current rect.bottom
        const newHeight = Math.max(100, initialBottomRef.current - e.clientY);
        onDimensionsChange(false, { width: dimensions.width, height: newHeight });
        onPositionChange({ x: position.x, y: initialBottomRef.current - newHeight });
      } else {
        // Original behavior for top corners
        const rect = wrapperRef.current.getBoundingClientRect();
        const newHeight = Math.max(100, e.clientY - rect.top);
        onDimensionsChange(false, { width: dimensions.width, height: newHeight });
      }
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

  // Modify handleResizeStart to store initial bottom position
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      initialBottomRef.current = rect.bottom;
    }
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
            ? "linear-gradient(69deg, rgba(255, 255, 255, 0.25) 52%, rgba(255, 255, 255, 0.1) 97%)"
            : "linear-gradient(69deg, rgba(255, 255, 255, 0.25) 12%, rgba(255, 255, 255, 0.1) 77%)",
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
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
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
            ...(bottom ? { top: -3 } : { bottom: -3 }),
            ...(bottom ? { rotate: "-90deg" } : {}),
            right: -3,
            width: "16px",
            height: "16px",
            ...(bottom ? { cursor: "nesw-resize" } : { cursor: "nwse-resize" }),
            borderRight: "6px solid grey",
            borderBottom: "6px solid grey",
            borderRadius: "4px",
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}

export default DraggableWrapper;
