import type { IToggle } from '@/models/Tools/PropertySpecs';

type ToggleProps = {
  toggleProperties: IToggle;
  onChange: (checked: boolean) => void;
};

const Toggle = ({ toggleProperties }: ToggleProps) => {
  return (
    <>
      <p>{toggleProperties.label}</p>
    </>
  );
};
export default Toggle;
