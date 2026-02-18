import { IMultiChoice, ISlider, IToggle, UIControlSpec } from './PropertySpecs';

export enum PropertyType {
  Size = 0,
  SmoothEdgeProperty = 1,
  Replace = 2,
  Opacity = 3,
  StrokeWidth = 4,
  FillProperty = 5,
  StrokeAlignProperty = 6,
  Tolerance = 7,
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
