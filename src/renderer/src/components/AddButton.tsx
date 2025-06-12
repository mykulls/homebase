import React, { useState } from "react";
import "./OptionButton.css";
import "./AddButton.css";
import { WidgetType } from "./Widget";

interface AddButtonProps {
  onAddWidget: (type: WidgetType) => void;
}

function AddButton({ onAddWidget }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="option-button-container">
      <button onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">+</span>
      </button>

      <div
        className="add-menu"
        style={{ visibility: isOpen ? "visible" : "hidden", opacity: isOpen ? 1 : 0, transition: "all 0.2s ease" }}
      >
        <div className="add-option">
          <button
            onClick={() => {
              onAddWidget(WidgetType.Youtube);
            }}
          >
            <i className="bi bi-youtube" style={{ marginTop: 2 }}></i>
          </button>
        </div>

        <div className="add-option">
          <button
            onClick={() => {
              onAddWidget(WidgetType.Spotify);
            }}
          >
            <i className="bi bi-spotify"></i>
          </button>
        </div>
        <div className="add-option">
          <button
            onClick={() => {
              onAddWidget(WidgetType.Calendar);
            }}
          >
            <i className="bi bi-calendar"></i>{" "}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddButton;
