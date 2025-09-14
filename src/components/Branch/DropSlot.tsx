"use client";

import React, { useState } from "react";
import styles from "@/components/Branch/Branch.module.css"

type DropSlotProps = {
  parentId: string;
  index: number; 
  onMoveAtIndex: (dragId: string, parentId: string, index: number) => void;
};

export const DropSlot = React.memo(function DropSlot({ parentId, index, onMoveAtIndex }: DropSlotProps) {
  const [over, setOver] = useState(false);

  return (
    <div
      className={`${styles.dropSlot} ${over ? styles.dropSlotOver : ""}`}
      onDragEnter={(e) => { e.preventDefault(); setOver(true); }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const dragId = e.dataTransfer.getData("application/x-branch");
        if (dragId) onMoveAtIndex(dragId, parentId, index);
      }}
    />
  );
});