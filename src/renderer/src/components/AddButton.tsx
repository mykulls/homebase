import React, { useState } from "react";
import "./AddButton.css";
import { WidgetType } from "./Widget";

interface AddButtonProps {
  onAddWidget: (type: WidgetType) => void;
}

function AddButton({ onAddWidget }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="add-button-container">
      <button className="add-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="add-caret">^</span>
        <span className="add-icon">+</span>
      </button>

      {isOpen && (
        <div className="add-menu">
          <button
            className="add-option"
            onClick={() => {
              onAddWidget(WidgetType.Youtube);
              setIsOpen(false);
            }}
          >
            YouTube Widget
          </button>
          <button
            className="add-option"
            onClick={() => {
              onAddWidget(WidgetType.Spotify);
              setIsOpen(false);
            }}
          >
            Spotify Widget
          </button>
          <button
            className="add-option"
            onClick={() => {
              onAddWidget(WidgetType.Calendar);
              setIsOpen(false);
            }}
          >
            Calendar Widget
          </button>
        </div>
      )}
    </div>
  );
}

export default AddButton;
