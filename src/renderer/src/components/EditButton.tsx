import React from "react";
import "./OptionButton.css";

interface EditButtonProps {
  isEditMode: boolean;
  toggleEditMode: () => void;
}

function EditButton({ isEditMode, toggleEditMode }: EditButtonProps) {
  return (
    <div className="option-button-container">
      <button onClick={toggleEditMode}>
        {isEditMode ? (
          <span className="icon">
            <i className="bi bi-lock" style={{ marginTop: 2 }}></i>
          </span>
        ) : (
          <span className="icon">
            <i className="bi bi-gear" style={{ marginTop: 2 }}></i>
          </span>
        )}
      </button>
    </div>
  );
}

export default EditButton;
