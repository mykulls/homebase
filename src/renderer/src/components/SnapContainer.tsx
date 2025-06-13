import React, { useState, ReactNode, useEffect } from "react";

interface SnapContainerProps {
  startBox: number;
  onDragEnd: (box: number, nextBox: number) => void;
  onDelete: (box: number) => void;
  boxOccupied: (box: number) => boolean;
  newBox: number | null;
  nullNewBox: () => void;
  children: (props: {
    position: { x: number; y: number };
    onPositionChange: (position: { x: number; y: number }) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDelete: () => void;
    onDimensionsChange: (final: boolean, dimensions: { width: number; height: number }) => void;
    dimensions: { width: number; height: number };
    defaultDim: { width: number; height: number };
    smallWidget: boolean;
  }) => ReactNode;
}

function SnapContainer({
  startBox,
  onDragEnd,
  onDelete,
  boxOccupied,
  newBox,
  nullNewBox,
  children,
}: SnapContainerProps) {
  const initWidth = window.innerWidth;
  const initHeight = window.innerHeight;
  const topSpacing = 100;
  const padding = 20;
  const sectionWidth = Math.min(initWidth * 0.2, 420); // 20% of screen width or max 420px
  const sectionHeight = Math.min((initHeight - padding * 4 - topSpacing) / 3, 360); // Divide height into 3 equal sections, subtract 100 for top-most controls
  const boxPositions = [...Array(3)].map((_, i) => ({
    x: padding,
    y: topSpacing + padding * (i + 1) + sectionHeight * i,
  }));

  const defaultDim = { width: sectionWidth, height: sectionHeight };
  const [dimensions, setDimensions] = useState(defaultDim);
  const [position, setPosition] = useState(boxPositions[startBox]);
  const [curBox, setBox] = useState(startBox);
  const [dragging, setDragging] = useState(false);
  const [nearestBox, setNearestBox] = useState<{ x: number; y: number } | null>(null);
  const [smallWidget, setSmall] = useState(false);

  useEffect(() => {
    setPosition(boxPositions[startBox]);
  }, [startBox]);

  useEffect(() => {
    if (newBox === null) return;

    setBox(newBox);
    setPosition(boxPositions[newBox]);
    nullNewBox();
  }, [newBox, dimensions]);

  const snapToBox = (pos: { x: number; y: number }) => {
    const { innerWidth, innerHeight } = window;

    // Find the nearest box
    let nextPos = boxPositions[0];
    let nextBox = 0;
    let minDistance = Number.MAX_VALUE;

    boxPositions.forEach((boxPos, index) => {
      const distance = Math.hypot(pos.x - boxPos.x, pos.y - boxPos.y);
      if (distance < minDistance) {
        minDistance = distance;
        nextPos = boxPos;
        nextBox = index;
      }
    });

    setNearestBox(nextPos);
    return { nextPos, nextBox };
  };

  const handlePositionChange = (newPosition: { x: number; y: number }) => {
    if (dragging) {
      setPosition(newPosition);
      snapToBox(newPosition);
    }
  };

  const handleDragStart = () => {
    setDragging(true);
    nullNewBox();
  };

  const handleDragEnd = () => {
    const { nextPos, nextBox } = snapToBox(position);
    nullNewBox();
    setPosition(nextPos);
    setBox(nextBox);
    onDragEnd(curBox, nextBox);
    setDragging(false);
  };

  const handleDimensionsChange = (final: boolean, newDimensions: { width: number; height: number }) => {
    let newHeight = newDimensions.height;

    if (newDimensions.height < defaultDim.height * 0.88) {
      setSmall(true);
    } else {
      setSmall(false);
    }

    if (final) {
      newHeight = defaultDim.height;
      if (newDimensions.height < defaultDim.height / 2) {
        newHeight = defaultDim.height / 2;
        setSmall(true);
      } else {
        setSmall(false);
      }

      setPosition(boxPositions[curBox]);
    }
    setDimensions({ width: newDimensions.width, height: newHeight });
  };

  const handleDelete = () => {
    onDelete(curBox);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", zIndex: dragging ? 1 : 0 }}>
      {dragging &&
        boxPositions.map((boxPosition, box) => {
          const isNearest = nearestBox?.x === boxPosition.x && nearestBox?.y === boxPosition.y;

          return (
            (box === curBox || !boxOccupied(box)) && (
              <div
                key={box}
                style={{
                  position: "absolute",
                  left: boxPosition.x,
                  top: boxPosition.y,
                  width: `${dimensions.width}px`,
                  height: `${dimensions.height}px`,
                  border: "2px dashed white",
                  opacity: isNearest ? 0.7 : 0.2,
                  pointerEvents: "none",
                  transform: "translate(-2px, -2px)",
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
        defaultDim: defaultDim,
        smallWidget,
      })}
    </div>
  );
}

export default SnapContainer;
