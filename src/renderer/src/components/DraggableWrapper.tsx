import React, { useState, useRef, useEffect } from "react";

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
  onDimensionsChange?: (dimensions: { width: number; height: number }) => void;
}

function DraggableWrapper({
  children,
  position,
  draggable = true, // Default to true
  collapsed = false,
  onMouseEnter = () => {},
  onMouseLeave = () => {},
  onPositionChange = () => {},
  onDragStart = () => {},
  onDragEnd = () => {},
  onDimensionsChange = () => {},
}: DraggableWrapperProps) {
  const [dragging, setDragging] = useState(false);
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
  }

  useEffect(() => {
    if (draggable && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      onDimensionsChange({ width: rect.width, height: rect.height }); // Pass dimensions upwards
    }
  }, [onDimensionsChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable) return; // Prevent dragging if not draggable

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable) return; // Prevent dragging if not draggable

    if (!dragging || !draggable) return;
    onPositionChange({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handleMouseUp = () => {
    if (!draggable) return; // Prevent dragging if not draggable

    if (dragging) {
      setDragging(false);
      onDragEnd(); // Notify SnapContainer that dragging has ended
    }
  };

  return (
    <div
      ref={wrapperRef} // Attach ref to the wrapper
      className="draggable"
      style={{
        display: "flex",
        position: "absolute",
        left: position.x,
        top: position.y,
        userSelect: "none",
        cursor: draggable && dragging ? "grabbing" : draggable ? "grab" : "default",
        opacity: dragging ? 0.5 : 1, // Transparent view while dragging
        transition: dragging ? "none" : "all 0.2s ease-out", // Smooth snapping
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

export default DraggableWrapper;
