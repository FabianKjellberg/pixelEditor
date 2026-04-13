import { getPixelPositions } from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';
import { intToColor, rgbaToInt } from '@/helpers/color';
import { blendColor } from '@/util/ColorUtil';
import { RGBA } from './Color';

export class EyedropperTool implements ITool {
  deps: IToolDeps;
  name: string = 'eyedropper';

  dropping: boolean = false;
  getColorFromCanvas: (x: number, y: number) => RGBA;

  constructor(tooldeps: IToolDeps, getColorFromCanvas: (x: number, y: number) => RGBA) {
    this.deps = tooldeps;
    this.getColorFromCanvas = getColorFromCanvas;
  }

  onDown(x: number, y: number, pixelSize: number): void {
    this.dropping = true;
    const pos = getPixelPositions(x, y, pixelSize);
    this.selectColor(pos.x, pos.y);
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (this.dropping) {
      const pos = getPixelPositions(x, y, pixelSize);
      this.selectColor(pos.x, pos.y);
    }
  }
  onUp(x: number, y: number, pixelSize: number): void {
    this.dropping = false;
  }

  private selectColor(x: number, y: number) {
    const color: RGBA = this.getColorFromCanvas(x, y);

    if (color.a === 0) {
      return;
    }

    const top = rgbaToInt(color.r, color.g, color.b, color.a);

    const blendedToWhite = blendColor(top, -1);

    const c = intToColor(blendedToWhite);

    this.deps.setPrimaryColor?.(c);
  }
}
