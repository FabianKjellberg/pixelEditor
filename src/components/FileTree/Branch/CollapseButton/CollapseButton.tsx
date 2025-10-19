import React from "react";
import styles from "./CollapseButton.module.css";

interface collapseButtonProps {
  expanded: boolean;
  onToggle: () => void;
  controlsId: string
}

export const CollapseButton = React.memo(function CollapseButton({
  expanded, onToggle, controlsId
}: collapseButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controlsId}
      onClick={onToggle}
      className={`${styles.chevronBtn}`}
      title={expanded ? "Collapse" : "Expand"}
    >
      <svg
        className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ""}`}
        width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
});