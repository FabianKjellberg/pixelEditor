'use client';

import { ITool } from '@/models/Tools/Tools';
import styles from './ToolButton.module.css';
import { useToolContext } from '@/context/ToolContext';
import { useMemo } from 'react';
import Image from 'next/image';

type ToolButtonProps = {
  icon: string;
  tool: ITool;
};

const ToolButton = ({ icon, tool }: ToolButtonProps) => {
  const { activeTool, setActiveTool } = useToolContext();

  const isSelected: boolean = useMemo(() => activeTool.name === tool.name, [activeTool, tool.name]);

  const onClickToolButton = () => {
    setActiveTool(tool);
  };

  return (
    <>
      <button className={styles.toolButton} onClick={onClickToolButton} aria-pressed={isSelected}>
        <Image alt="" src={icon} className={styles.icon} width={64} height={64} />
      </button>
    </>
  );
};

export default ToolButton;
