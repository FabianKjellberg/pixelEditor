'use client';

import { IButton } from '@/models/properties/PropertySpecs';
import PropertyLabel from '../PropertyLabel/PropertyLabel';
import { useCallback, useMemo } from 'react';
import { useToolContext } from '@/context/ToolContext';

type PropertyButtonType = {
  value: string;
  buttonProperties: IButton;
};

const PropertyButton = ({ value, buttonProperties }: PropertyButtonType) => {
  const { activeTool } = useToolContext();

  const onClickCallback = useCallback(() => {
    activeTool.onAction?.(value);
  }, [value]);

  const useLabel = useMemo(() => !!buttonProperties.imgUrl, []);

  return (
    <>
      <PropertyLabel label={buttonProperties.label} />
      <button onClick={onClickCallback}>
        {useLabel ? (
          buttonProperties.btnLabel
        ) : (
          <img src={buttonProperties.imgUrl} width={32} height={32} />
        )}
      </button>
    </>
  );
};

export default PropertyButton;
