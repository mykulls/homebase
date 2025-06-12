import React from "react";
import "./ExpandCollapseButton.css";

interface ExpandCollapseButtonProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

function ExpandCollapseButton({ collapsed, toggleCollapse }: ExpandCollapseButtonProps) {
  return (
    <div className="expand-collapse-container">
      <button className="expand-collapse-button" onClick={toggleCollapse}>
        <span
          style={{ rotate: collapsed ? "90deg" : "-90deg", marginLeft: collapsed ? 32 : 48 }}
          className="expand-collapse-caret"
        >
          ^
        </span>
      </button>
    </div>
  );
}

export default ExpandCollapseButton;
