export interface ISlider {
  type: 'slider';
  label: string;
  min: number;
  max: number;
  linear?: boolean;
  unit?: string;
}

export interface IToggle {
  type: 'toggle';
  label: string;
}

export type UIControlSpec = ISlider | IToggle;
