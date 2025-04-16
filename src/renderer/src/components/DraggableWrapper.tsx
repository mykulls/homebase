import React, { useState, useRef } from "react";

interface DraggableWrapperProps {
  children: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  defaultPosition?: { x: number; y: number };
}

function DraggableWrapper({
  children,
  onMouseEnter,
  onMouseLeave,
  defaultPosition = { x: 100, y: 100 },
}: DraggableWrapperProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();

    // Don't start dragging if clicked on input elements
    const isFormElement = ["input", "textarea", "button", "select"].includes(tag);
    if (isFormElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragging(true);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className="draggable"
      style={{
        display: "flex",
        position: "absolute",
        left: position.x,
        top: position.y,
        userSelect: "none",
        cursor: dragging ? "grabbing" : "grab",
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
