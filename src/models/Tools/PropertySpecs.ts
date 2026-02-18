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

export interface IMultiChoice {
  type: 'multiChoice';
  label: string;
  choices: string[];
  allowEmpty: boolean;
}

export type UIControlSpec = ISlider | IToggle | IMultiChoice;
