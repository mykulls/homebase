import React, { useState, ReactNode, useEffect } from "react";

export enum Corner {
  // string enums for looping
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}

interface SnapContainerProps {
  startCorner: Corner;
  onDragEnd: (corner: Corner, nextCorner: Corner) => void;
  onDelete: (corner: Corner) => void;
  cornerOccupied: (corner: Corner) => boolean;
  children: (props: {
    position: { x: number; y: number };
    onPositionChange: (position: { x: number; y: number }) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDelete: () => void;
    onDimensionsChange: (final: boolean, dimensions: { width: number; height: number }) => void;
    dimensions: { width: number; height: number };
    widgetSize: number;
  }) => ReactNode;
}

function SnapContainer({ startCorner, onDragEnd, onDelete, cornerOccupied, children }: SnapContainerProps) {
  const initWidth = window.innerWidth;
  const initHeight = window.innerHeight;
  const getCorners = (innerWidth: number, innerHeight: number, padding: number, width: number, height: number) => {
    return {
      [Corner.TopLeft]: { x: padding, y: padding },
      [Corner.TopRight]: { x: innerWidth - width - padding, y: padding },
      [Corner.BottomRight]: { x: innerWidth - width - padding, y: innerHeight - height - padding }, // Bottom right
      [Corner.BottomLeft]: { x: padding, y: innerHeight - height - padding },
    };
  };

  const defaultDim = { width: 420, height: 360 };
  const padding = 20; // Distance from the edges
  const [dimensions, setDimensions] = useState(defaultDim); // Store dimensions
  const [position, setPosition] = useState(
    getCorners(initWidth, initHeight, padding, defaultDim.width, defaultDim.height)[startCorner]
  ); // Position based on corner
  const [curCorner, setCorner] = useState(startCorner);
  const [dragging, setDragging] = useState(false);
  const [nearestCorner, setNearestCorner] = useState<{ x: number; y: number } | null>(null);
  const [widgetSize, setWidgetSize] = useState(0);

  // Calculate initial position based on the corner prop
  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    const initialPosition = getCorners(innerWidth, innerHeight, padding, defaultDim.width, defaultDim.height);

    setPosition(initialPosition[startCorner]);
  }, [startCorner]);

  const snapToCorner = (pos: { x: number; y: number }) => {
    const { innerWidth, innerHeight } = window;
    const { width, height } = dimensions;

    const corners = getCorners(innerWidth, innerHeight, padding, width, height);

    // Find the nearest corner
    let nextPos = corners[Corner.TopLeft];
    let nextCorner = Corner.TopLeft;
    let minDistance = Number.MAX_VALUE;

    Object.entries(corners).forEach(([corner, cornerPos]) => {
      const distance = Math.hypot(pos.x - cornerPos.x, pos.y - cornerPos.y);
      if (distance < minDistance) {
        minDistance = distance;
        nextPos = cornerPos;
        nextCorner = corner as Corner; // Cast to Corner enum
      }
    });

    setNearestCorner(nextPos); // Update the nearest corner
    return { nextPos, nextCorner };
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
    const { nextPos, nextCorner } = snapToCorner(position);
    if (cornerOccupied(nextCorner)) {
      const { innerWidth, innerHeight } = window;
      const { width, height } = dimensions;
      setPosition(getCorners(innerWidth, innerHeight, padding, width, height)[curCorner]);
      onDragEnd(curCorner, curCorner);
    } else {
      setPosition(nextPos);
      setCorner(nextCorner);
      onDragEnd(curCorner, nextCorner);
    }
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

  const handleDelete = () => {
    onDelete(curCorner);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {dragging &&
        Object.values(Corner).map((corner) => {
          const { innerWidth, innerHeight } = window;
          const { width, height } = dimensions;
          const cornerPosition = getCorners(innerWidth, innerHeight, padding, width, height)[corner];
          const isNearest = nearestCorner?.x === cornerPosition.x && nearestCorner?.y === cornerPosition.y;
          return (
            (corner === curCorner || !cornerOccupied(corner)) && (
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
            )
          );
        })}

      {children({
        position,
        onPositionChange: handlePositionChange,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDelete: handleDelete,
        onDimensionsChange: handleDimensionsChange,
        dimensions: dimensions,
        widgetSize: widgetSize,
      })}
    </div>
  );
}

export default SnapContainer;
