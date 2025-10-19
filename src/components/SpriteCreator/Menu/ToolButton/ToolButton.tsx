'use client';

import { ITool } from '@/models/Tools/Tools';
import styles from './ToolButton.module.css';
import { useToolContext } from '@/context/ToolContext';
import { useMemo } from 'react';

type ToolButtonProps = {
  icon: string;
  tool: ITool;
};

const ToolButton = ({ icon, tool }: ToolButtonProps) => {
  const { activeTool, setActiveTool } = useToolContext();

  const isSelected: boolean = useMemo(() => activeTool.name === tool.name, [activeTool]);

  const onClickToolButton = () => {
    setActiveTool(tool);
  };

  return (
    <>
      <button className={styles.toolButton} onClick={onClickToolButton} aria-pressed={isSelected}>
        <img src={icon} className={styles.icon} />
      </button>
    </>
  );
};

export default ToolButton;
