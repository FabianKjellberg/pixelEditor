'use client';

import { IProperty, upsertProperty } from '@/models/Tools/Properties';
import { IMultiChoice, ISlider, IToggle } from '@/models/Tools/PropertySpecs';
import Slider from './Slider/Slider';
import Toggle from './Toggle/Toggle';
import { useToolContext } from '@/context/ToolContext';
import { useMemo } from 'react';
import styles from './Properties.module.css';
import MultiChoice from './MultiChoice/MultiChoice';

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
              key={`${activeTool.name}-${p.propertyType}-${index}`}
              sliderProperties={p.spec}
              value={p.value}
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
              key={`${activeTool.name}-${p.propertyType}-${index}`}
              value={p.value}
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

        case 'multiChoice': {
          const p = property as IProperty<string | null, IMultiChoice>;
          return (
            <MultiChoice
              key={`${activeTool.name}-${p.propertyType}-${index}`}
              multiChoiceProperties={p.spec}
              value={p.value}
              onChange={(choice: string | null) => {
                const next = Object.create(Object.getPrototypeOf(p)) as typeof p;
                Object.assign(next, p);
                next.value = choice;
                setProperties?.(activeTool.name, upsertProperty(properties, next));
              }}
            />
          );
        }

        default:
          return <div key={`${activeTool.name}-default-${index}`}> </div>;
      }
    });
  }, [properties, setProperties, activeTool.name]);

  return <div className={styles.properties}>{propertyRenders && propertyRenders}</div>;
};

export default PropertyControls;
