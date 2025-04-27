import React, { useState, ReactNode } from "react";

interface SnapContainerProps {
  children: (props: {
    position: { x: number; y: number };
    onPositionChange: (position: { x: number; y: number }) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDimensionsChange: (dimensions: { width: number; height: number }) => void;
  }) => ReactNode;
}

const SnapContainer: React.FC<SnapContainerProps> = ({ children }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // Store dimensions

  const snapToCorner = (pos: { x: number; y: number }) => {
    const { innerWidth, innerHeight } = window;
    const padding = 20; // Distance from the edges

    // Use the dimensions of the DraggableWrapper
    const { width, height } = dimensions;

    // Define the 4 corners, accounting for the dimensions of the DraggableWrapper
    const corners = [
      { x: padding, y: padding }, // Top left
      { x: innerWidth - width - padding, y: padding }, // Top right
      { x: padding, y: innerHeight - height - padding }, // Bottom left
      { x: innerWidth - width - padding, y: innerHeight - height - padding }, // Bottom right
    ];

    // Find the nearest corner
    let nearestCorner = corners[0];
    let minDistance = Number.MAX_VALUE;

    corners.forEach((corner) => {
      const distance = Math.hypot(pos.x - corner.x, pos.y - corner.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCorner = corner;
      }
    });

    return nearestCorner;
  };

  const handlePositionChange = (newPosition: { x: number; y: number }) => {
    if (dragging) {
      // Allow free dragging while the user is actively dragging
      setPosition(newPosition);
    }
  };

  const handleDragStart = () => {
    setDragging(true);
  };

  const handleDragEnd = () => {
    // Snap to the nearest corner when dragging ends
    const snappedPosition = snapToCorner(position);
    setPosition(snappedPosition);
    setDragging(false);
  };

  const handleDimensionsChange = (newDimensions: { width: number; height: number }) => {
    setDimensions(newDimensions); // Update dimensions
  };

  return (
    <>
      {children({
        position,
        onPositionChange: handlePositionChange,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDimensionsChange: handleDimensionsChange, // Pass dimensions handler
      })}
    </>
  );
};

export default SnapContainer;
