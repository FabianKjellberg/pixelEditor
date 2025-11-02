import type { ISlider } from '@/models/Tools/PropertySpecs';
import { useEffect, useMemo } from 'react';

export type SliderProps = {
  sliderProperties: ISlider;
  value: number;
  onChange: (value: number) => void;
};

const Slider = ({ sliderProperties, value, onChange }: SliderProps) => {
  const sliderValue = useMemo(() => value, [value]);

  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <>
      <button onClick={() => onChange(sliderValue - 1)}>-</button>
      {sliderValue}
      <button onClick={() => onChange(sliderValue + 1)}>+</button>
    </>
  );
};
export default Slider;
