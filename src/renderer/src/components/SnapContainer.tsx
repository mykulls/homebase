import React, { useState, ReactNode } from "react";

interface SnapContainerProps {
  children: (props: {
    position: { x: number; y: number };
    onPositionChange: (position: { x: number; y: number }) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDimensionsChange: (final: boolean, dimensions: { width: number; height: number }) => void;
    dimensions: { width: number; height: number };
    widgetSize: number;
  }) => ReactNode;
}

function SnapContainer({ children }: SnapContainerProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const defaultDim = { width: 420, height: 360 };
  const [dimensions, setDimensions] = useState(defaultDim); // Store dimensions
  const [nearestCorner, setNearestCorner] = useState<{ x: number; y: number } | null>(null);
  const [widgetSize, setWidgetSize] = useState(0);

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
    let nearest = corners[0];
    let minDistance = Number.MAX_VALUE;

    corners.forEach((corner) => {
      const distance = Math.hypot(pos.x - corner.x, pos.y - corner.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = corner;
      }
    });

    setNearestCorner(nearest); // Update the nearest corner
    return nearest;
  };

  const handlePositionChange = (newPosition: { x: number; y: number }) => {
    if (dragging) {
      // Allow free dragging while the user is actively dragging
      setPosition(newPosition);
      snapToCorner(newPosition); // Update nearest corner dynamically
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

  const handleDimensionsChange = (final: boolean, newDimensions: { width: number; height: number }) => {
    let newHeight = newDimensions.height;
    if (final) {
      newHeight = newDimensions.height < defaultDim.height / 2 ? defaultDim.height / 2 : defaultDim.height;
    }
    setDimensions({ width: newDimensions.width, height: newHeight });
    if (newHeight <= defaultDim.height * 0.9) {
      setWidgetSize(1);
    } else {
      setWidgetSize(0);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Render dotted borders for the corners only when dragging */}
      {dragging &&
        ["top-left", "top-right", "bottom-left", "bottom-right"].map((corner, index) => {
          const { innerWidth, innerHeight } = window;
          const padding = 20;
          const { width, height } = dimensions;

          // Calculate corner positions
          const cornerPositions = [
            { x: padding, y: padding }, // Top left
            { x: innerWidth - width - padding, y: padding }, // Top right
            { x: padding, y: innerHeight - height - padding }, // Bottom left
            { x: innerWidth - width - padding, y: innerHeight - height - padding }, // Bottom right
          ];

          const cornerPosition = cornerPositions[index];
          const isNearest = nearestCorner?.x === cornerPosition.x && nearestCorner?.y === cornerPosition.y;

          return (
            <div
              key={corner}
              style={{
                position: "absolute",
                left: cornerPosition.x,
                top: cornerPosition.y,
                width: `${width}px`,
                height: `${height}px`,
                border: "2px dashed white",
                opacity: isNearest ? 0.7 : 0.2, // Adjust opacity based on nearest corner
                pointerEvents: "none", // Prevent interaction
                transform: "translate(-2px, -2px)", // Adjust for border width
                borderRadius: "12px",
              }}
            />
          );
        })}

      {/* Render children */}
      {children({
        position,
        onPositionChange: handlePositionChange,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDimensionsChange: handleDimensionsChange,
        dimensions: dimensions,
        widgetSize: widgetSize,
      })}
    </div>
  );
}

export default SnapContainer;
