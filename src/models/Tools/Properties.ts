import { ISlider, IToggle, UIControlSpec } from './PropertySpecs';

export enum PropertyType {
  Size = 0,
  SmoothEdgeProperty = 1,
}

export class SizeProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Size;
  spec: ISlider = {
    type: 'slider',
    label: 'size',
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

export interface IProperty<T = unknown, S extends UIControlSpec = UIControlSpec> {
  readonly propertyType: PropertyType;
  readonly spec: S;
  get value(): T;
  set value(v: T);
}

export class SmoothEdgeProperty implements IProperty {
  propertyType: PropertyType = PropertyType.SmoothEdgeProperty;
  spec: IToggle = {
    type: 'toggle',
    label: 'Smooth edge',
  };
  constructor(private _value: boolean = false) {}
  get value() {
    return this._value;
  }
  set value(v: boolean) {
    this._value = !!v;
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
