import React, { useState, ReactNode, useEffect } from "react";

export enum Corner {
  // string enums for looping
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}

interface SnapContainerProps {
  corner: Corner; // New prop to determine the initial corner
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

function SnapContainer({ corner, children }: SnapContainerProps) {
  const defaultDim = { width: 420, height: 360 };
  const [dimensions, setDimensions] = useState(defaultDim); // Store dimensions
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position based on corner
  const [dragging, setDragging] = useState(false);
  const [nearestCorner, setNearestCorner] = useState<{ x: number; y: number } | null>(null);
  const [widgetSize, setWidgetSize] = useState(0);

  const getCorners = (innerWidth: number, innerHeight: number, padding: number, width: number, height: number) => {
    return {
      [Corner.TopLeft]: { x: padding, y: padding },
      [Corner.TopRight]: { x: innerWidth - width - padding, y: padding },
      [Corner.BottomRight]: { x: innerWidth - width - padding, y: innerHeight - height - padding }, // Bottom right
      [Corner.BottomLeft]: { x: padding, y: innerHeight - height - padding },
    };
  };

  // Calculate initial position based on the corner prop
  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    const padding = 20; // Distance from the edges

    const initialPosition = getCorners(innerWidth, innerHeight, padding, defaultDim.width, defaultDim.height);

    setPosition(initialPosition[corner]);
  }, [corner]);

  const snapToCorner = (pos: { x: number; y: number }) => {
    const { innerWidth, innerHeight } = window;
    const padding = 20; // Distance from the edges

    // Use the dimensions of the DraggableWrapper
    const { width, height } = dimensions;

    const corners = getCorners(innerWidth, innerHeight, padding, width, height);

    // Find the nearest corner
    let nearest = corners[Corner.TopLeft];
    let minDistance = Number.MAX_VALUE;

    Object.values(corners).forEach((corner) => {
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
      {dragging &&
        Object.values(Corner).map((corner) => {
          const { innerWidth, innerHeight } = window;
          const padding = 20;
          const { width, height } = dimensions;
          const cornerPosition = getCorners(innerWidth, innerHeight, padding, width, height)[corner];
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
                opacity: isNearest ? 0.7 : 0.2, // Highlight the nearest corner
                pointerEvents: "none",
                transform: "translate(-2px, -2px)", // Adjust for border width
                borderRadius: "12px",
              }}
            />
          );
        })}

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
