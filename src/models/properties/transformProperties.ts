import { CenteredRectangle } from '../Layer';
import { IProperty, PropertyType } from './Properties';
import { IButton, IMultiChoice, INone } from './PropertySpecs';

export class TransformProperty implements IProperty {
  propertyType: PropertyType = PropertyType.Transform;
  spec: INone = {
    type: 'none',
  };
  constructor(private _value: CenteredRectangle | undefined = undefined) {}
  get value() {
    return this._value;
  }
  set value(v: CenteredRectangle | undefined) {
    this._value = v;
  }
}

export class TransformInterpolation implements IProperty {
  propertyType: PropertyType = PropertyType.TransformInterpolation;
  spec: IMultiChoice = {
    allowEmpty: false,
    label: 'Rendering',
    choices: ['Nearest Neighbor', 'Bilinear'],
    type: 'multiChoice',
  };
  constructor(private _value: string | null = 'Nearest Neighbor') {}
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

export class FlipHorizontally implements IProperty {
  propertyType: PropertyType = PropertyType.FlipHorizontally;
  spec: IButton = {
    type: 'button',
    label: 'Flip horizontally',
    imgUrl: '/icons/horizontal.png',
  };
  constructor(private _value: string = 'horizontal') {}
  get value() {
    return this._value;
  }
  set value(v: string) {
    this._value = v;
  }
}

export class FlipVertically implements IProperty {
  propertyType: PropertyType = PropertyType.FlipVertically;
  spec: IButton = {
    type: 'button',
    label: 'Flip vertically',
    imgUrl: '/icons/vertical.png',
  };
  constructor(private _value: string = 'vertical') {}
  get value() {
    return this._value;
  }
  set value(v: string) {
    this._value = v;
  }
}
