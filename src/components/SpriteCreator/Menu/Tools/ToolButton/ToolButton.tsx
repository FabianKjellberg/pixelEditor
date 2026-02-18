'use client';

import { ITool } from '@/models/Tools/Tools';
import styles from './ToolButton.module.css';
import { useToolContext } from '@/context/ToolContext';
import { useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';

type ToolButtonProps = {
  icon: string;
  tool: ITool;
  multiple?: boolean;
  onRightClickCallback?: ((x: number, y: number) => void) | null;
};

const ToolButton = ({ icon, tool, onRightClickCallback = null }: ToolButtonProps) => {
  const { activeTool, setActiveTool } = useToolContext();

  const isSelected = useMemo(() => activeTool.name === tool.name, [activeTool.name, tool.name]);

  const divRef = useRef<HTMLDivElement | null>(null);

  const onClickToolButton = useCallback(() => {
    setActiveTool(tool);
  }, [setActiveTool, tool]);

  const onContextmenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const ref = divRef.current;
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const x = rect.left;
      const y = rect.bottom;

      if (!onRightClickCallback) {
        onClickToolButton();
      } else {
        onRightClickCallback(x, y);
      }
    },
    [onRightClickCallback, onClickToolButton],
  );

  const showArrow = !!onRightClickCallback;

  return (
    <div ref={divRef}>
      <button
        className={`${styles.toolButton} ${showArrow ? styles.hasContextMenu : ''}`}
        onClick={onClickToolButton}
        aria-pressed={isSelected}
        onContextMenu={onContextmenu}
      >
        <Image alt="" src={icon} className={styles.icon} width={64} height={64} />
      </button>
    </div>
  );
};

export default ToolButton;
