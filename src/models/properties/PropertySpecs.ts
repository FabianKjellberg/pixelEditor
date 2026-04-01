import { CenteredRectangle } from '../Layer';

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

export interface IDithering {
  type: 'dithering';
  requiredChoice: 'Dithering';
  firstLabel: string;
  choices: string[];
}

export interface IButton {
  type: 'button';
  label: string;
  imgUrl?: string;
  btnLabel?: string;
}

export interface INone {
  type: 'none';
}

export type UIControlSpec = ISlider | IToggle | IMultiChoice | IDithering | INone | IButton;
