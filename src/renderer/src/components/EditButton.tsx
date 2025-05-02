import React from "react";
import "./EditButton.css";

interface EditButtonProps {
  isEditMode: boolean;
  toggleEditMode: () => void;
}

function EditButton({ isEditMode, toggleEditMode }: EditButtonProps) {
  return (
    <div className="edit-button-container">
      <button className="edit-button" onClick={toggleEditMode}>
        <span className="edit-caret">^</span>
        {isEditMode ? (
          <span className="edit-icon">🔒</span> // Lock icon for edit mode
        ) : (
          <span className="edit-icon">⚙️</span> // Gear icon for normal mode
        )}
      </button>
    </div>
  );
}

export default EditButton;
