import React, { useState } from "react";

type DragableBranchProps = {
  nodeId: string;
  onMove: (dragId: string, targetId: string) => void;
  dragEnabled?: boolean;
  className?: string;        
  overClassName?: string;    
  handleClassName?: string;  
  children: React.ReactNode;
};

export const DragableBranch = React.memo(function DragableBranch({
  nodeId,
  onMove,
  dragEnabled = true,
  className,
  overClassName,
  handleClassName,
  children,
}: DragableBranchProps) {
  const [isOver, setIsOver] = useState(false);

  const onDragStart = (e: React.DragEvent) => {
    if (!dragEnabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/x-branch", nodeId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();              
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  };

  const onDragLeave = () => setIsOver(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const dragId = e.dataTransfer.getData("application/x-branch");
    if (!dragId) return;
    onMove(dragId, nodeId);
  };

  return (
    <div
      className={`${className ?? ""} ${isOver && overClassName ? overClassName : ""}`}
      draggable={dragEnabled}         
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
});