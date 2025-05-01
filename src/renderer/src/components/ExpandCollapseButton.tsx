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
        <span className="expand-collapse-caret">^</span>
        {collapsed ? (
          <span className="expand-collapse-icon">+</span> // Icon for expand
        ) : (
          <span className="expand-collapse-icon">−</span> // Icon for collapse
        )}
      </button>
    </div>
  );
}

export default ExpandCollapseButton;
