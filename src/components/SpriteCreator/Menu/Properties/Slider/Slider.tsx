import type { ISlider } from '@/models/Tools/PropertySpecs';

export type SliderProps = {
  sliderProperties: ISlider;
  onChange: (value: number) => void;
};

const Slider = ({ sliderProperties }: SliderProps) => {
  return (
    <>
      <p>{sliderProperties?.label}</p>
    </>
  );
};
export default Slider;
