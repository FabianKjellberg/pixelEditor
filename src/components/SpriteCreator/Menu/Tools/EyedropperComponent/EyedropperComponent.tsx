'use client';

import React from 'react';
import ToolButton from '../ToolButton/ToolButton';
import { EyedropperTool } from '@/models/Tools/EyedropperTool';
import { useToolContext } from '@/context/ToolContext';
import { useCanvasContext } from '@/context/CanvasContext';

const EyedropperComponent = () => {
  const { setPrimaryColor } = useToolContext();
  const { getColorFromCanvas } = useCanvasContext();

  return (
    <ToolButton
      icon="/icons/eyedropper.png"
      tool={new EyedropperTool({ setPrimaryColor }, getColorFromCanvas)}
    />
  );
};

export default EyedropperComponent;
