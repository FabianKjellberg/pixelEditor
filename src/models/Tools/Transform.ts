import { IToolDeps, ITool } from './Tools';

export class Transform implements ITool {
  name: string = 'transform';
  deps: IToolDeps = {};
  onDown?(x: number, y: number, pixelSize: number, mouseButton: number): void {
    console.log('hej');
  }
  onMove?(x: number, y: number, pixelSize: number): void {}
  onUp?(x: number, y: number, pixelSize: number, mouseButton: number): void {
    console.log('hej');
  }
  onCommit?(): void {
    console.log('hej');
  }
  onCancel?(): void {
    console.log('hej');
  }
}
