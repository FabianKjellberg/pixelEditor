import { getPixelPositions } from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';
import { RGBAobj } from './Color';
import { rgbaToInt } from '@/helpers/color';

export class EyedropperTool implements ITool {
  deps: IToolDeps;
  name: string = 'eyedropper';

  dropping: boolean = false;
  getColorFromCanvas: (x: number, y: number) => RGBAobj;

  constructor(tooldeps: IToolDeps, getColorFromCanvas: (x: number, y: number) => RGBAobj) {
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
    const color: RGBAobj = this.getColorFromCanvas(x, y);

    if (color.a === 0) {
      return;
    }

    this.deps.setPrimaryColor?.(rgbaToInt(color.r, color.g, color.b));
  }
}
