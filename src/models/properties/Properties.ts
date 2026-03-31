import { CenteredRectangle } from '../Layer';
import { IDithering, IMultiChoice, INone, ISlider, IToggle, UIControlSpec } from './PropertySpecs';

export enum PropertyType {
  Size = 0,
  SmoothEdgeProperty = 1,
  Replace = 2,
  Opacity = 3,
  StrokeWidth = 4,
  FillProperty = 5,
  StrokeAlignProperty = 6,
  Tolerance = 7,
  SingleColor = 8,
  GradientType = 9,
  Dithering = 10,
  Transform = 11,
  TransformInterpolation = 12,
  FlipHorizontally = 13,
  FlipVertically = 14,
}

export interface IProperty<T = unknown, S extends UIControlSpec = UIControlSpec> {
  readonly propertyType: PropertyType;
  readonly spec: S;
  get value(): T;
  set value(v: T);
}

export class SizeProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Size;
  spec: ISlider = {
    type: 'slider',
    label: 'Size',
    min: 1,
    max: 255,
    linear: false,
  };
  constructor(private _value: number = 5) {}
  get value() {
    return this._value;
  }
  set value(v: number) {
    const clamped = Math.max(this.spec.min, Math.min(this.spec.max, Math.round(v)));
    this._value = clamped;
  }
}

export class SmoothEdgeProperty implements IProperty {
  propertyType: PropertyType = PropertyType.SmoothEdgeProperty;
  spec: IToggle = {
    type: 'toggle',
    label: 'Smooth edges',
  };
  constructor(private _value: boolean = false) {}
  get value() {
    return this._value;
  }
  set value(v: boolean) {
    this._value = !!v;
  }
}

export class ReplaceProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Replace;
  spec: IToggle = {
    type: 'toggle',
    label: 'Replace existing',
  };
  constructor(private _value: boolean = true) {}
  get value() {
    return this._value;
  }
  set value(v: boolean) {
    this._value = !!v;
  }
}

export class OpacityProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Opacity;
  spec: ISlider = {
    type: 'slider',
    label: 'Opacity',
    min: 1,
    max: 255,
    linear: true,
  };
  constructor(private _value: number = 255) {}
  get value() {
    return this._value;
  }
  set value(v: number) {
    const clamped = Math.max(this.spec.min, Math.min(this.spec.max, Math.round(v)));
    this._value = clamped;
  }
}

export class StrokeWidthProperty implements IProperty {
  propertyType: PropertyType = PropertyType.StrokeWidth;
  spec: ISlider = {
    type: 'slider',
    label: 'Stroke width',
    min: 1,
    max: 64,
    linear: true,
  };
  constructor(private _value: number = 2) {}
  get value() {
    return this._value;
  }
  set value(v: number) {
    const clamped = Math.max(this.spec.min, Math.min(this.spec.max, Math.round(v)));
    this._value = clamped;
  }
}

export class FillProperty implements IProperty {
  propertyType: PropertyType = PropertyType.FillProperty;
  spec: IToggle = {
    type: 'toggle',
    label: 'Fill shape',
  };
  constructor(private _value: boolean = false) {}
  get value() {
    return this._value;
  }
  set value(v: boolean) {
    this._value = !!v;
  }
}

export class StrokeAlignProperty implements IProperty {
  propertyType: PropertyType = PropertyType.StrokeAlignProperty;
  spec: IMultiChoice = {
    type: 'multiChoice',
    label: 'Align stroke',
    allowEmpty: false,
    choices: ['Centered', 'Inside', 'Outside'],
  };
  constructor(private _value: string | null = 'Inside') {}
  get value() {
    return this._value;
  }
  set value(v: string | null) {
    if (!this.spec.choices.some((c) => c === v)) {
      if (this.spec.allowEmpty) this._value = null;
      else this.value = this.spec.choices[0] ?? null;
    } else this._value = v;
  }
}

export class ToleranceProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Tolerance;
  spec: ISlider = {
    type: 'slider',
    label: 'Tolerance',
    min: 0,
    max: 255,
    linear: true,
  };
  constructor(private _value: number = 0) {}
  get value() {
    return this._value;
  }
  set value(v: number) {
    this._value = v;
  }
}

export class SingleColor implements IProperty {
  propertyType: PropertyType = PropertyType.SingleColor;
  spec: IToggle = {
    type: 'toggle',
    label: 'Single color',
  };
  constructor(private _value: boolean = true) {}
  get value() {
    return this._value;
  }
  set value(v: boolean) {
    this._value = !!v;
  }
}

export class GradientTypeProperty implements IProperty {
  propertyType: PropertyType = PropertyType.GradientType;
  spec: IMultiChoice = {
    allowEmpty: false,
    label: 'Gradient type',
    choices: ['Dithering', 'Random', 'Linear'],
    type: 'multiChoice',
  };
  constructor(private _value: string | null = 'Dithering') {}
  get value() {
    return this._value;
  }
  set value(v: string | null) {
    if (!this.spec.choices.some((c) => c === v)) {
      if (this.spec.allowEmpty) this._value = null;
      else this.value = this.spec.choices[0] ?? null;
    } else this._value = v;
  }
}

export class DitheringProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Dithering;
  spec: IDithering = {
    type: 'dithering',
    requiredChoice: 'Dithering',
    firstLabel: 'Size',
    choices: ['1x1', '2x2', '4x4', '8x8'],
  };
  constructor(private _value: DitheringValue = default2x2DitheringValue) {}
  get value() {
    return this._value;
  }
  set value(v: { default: boolean; size: number; pattern: number[][] }) {
    if (v.default) {
      this._value =
        v.size === 1
          ? default1x1DitheringValue
          : v.size === 2
            ? default2x2DitheringValue
            : v.size === 4
              ? default4x4DitheringValue
              : default8x8DitheringValue;
    } else {
      this._value = v;
    }
  }
}

export type AnyProperty = IProperty<unknown, UIControlSpec>;

export function getProperty<P extends AnyProperty>(
  props: AnyProperty[],
  type: P['propertyType'],
): P | undefined {
  return props.find((p) => p.propertyType === type) as P | undefined;
}

export function upsertProperty(props: AnyProperty[], next: AnyProperty): AnyProperty[] {
  const i = props.findIndex((p) => p.propertyType === next.propertyType);
  if (i === -1) return [...props, next];
  const copy = props.slice();
  copy[i] = next;
  return copy;
}

export type DitheringValue = {
  default: boolean;
  size: number;
  pattern: number[][];
};

export const default1x1DitheringValue: DitheringValue = {
  default: true,
  size: 1,
  pattern: [],
};

export const default2x2DitheringValue: DitheringValue = {
  default: true,
  size: 2,
  pattern: [
    [0, 2],
    [3, 1],
  ],
};

export const default4x4DitheringValue: DitheringValue = {
  default: true,
  size: 4,
  pattern: [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ],
};

export const default8x8DitheringValue: DitheringValue = {
  default: true,
  size: 8,
  pattern: [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21],
  ],
};
