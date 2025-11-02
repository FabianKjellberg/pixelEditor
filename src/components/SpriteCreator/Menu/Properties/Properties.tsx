'use client';

import { IProperty, upsertProperty } from '@/models/Tools/Properties';
import { ISlider, IToggle } from '@/models/Tools/PropertySpecs';
import Slider from './Slider/Slider';
import Toggle from './Toggle/Toggle';
import { useToolContext } from '@/context/ToolContext';
import { useMemo } from 'react';

const PropertyControls = () => {
  const { properties, setProperties, activeTool } = useToolContext();

  const propertyRenders = useMemo(() => {
    if (!properties) return <></>;
    return properties.map((property, index) => {
      const { spec } = property;

      switch (spec.type) {
        case 'slider': {
          const p = property as IProperty<number, ISlider>;
          return (
            <Slider
              key={index + p.propertyType}
              sliderProperties={p.spec}
              onChange={(v: number) => {
                const next = Object.create(Object.getPrototypeOf(p)) as typeof p;
                Object.assign(next, p);
                next.value = v;
                setProperties?.(activeTool.name, upsertProperty(properties, next));
              }}
            />
          );
        }

        case 'toggle': {
          const p = property as IProperty<boolean, IToggle>;
          return (
            <Toggle
              key={index}
              toggleProperties={p.spec}
              onChange={(checked: boolean) => {
                const next = Object.create(Object.getPrototypeOf(p)) as typeof p;
                Object.assign(next, p);
                next.value = checked;
                setProperties?.(activeTool.name, upsertProperty(properties, next));
              }}
            />
          );
        }

        default:
          return <div key={index}> </div>;
      }
    });
  }, [properties, setProperties]);

  return <div>{propertyRenders && propertyRenders}</div>;
};

export default PropertyControls;
