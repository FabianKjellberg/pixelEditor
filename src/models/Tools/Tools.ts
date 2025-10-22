import { Layer } from "../Layer";

export type IToolDeps = {
  getLayer?: () => Layer | undefined;
  setLayer?: (layer: Layer) => void;
  getColor?: () => number | undefined;
  setColor?: (color: number) => void
}

export interface ITool {
  name: string;
  onDown(x: number, y: number): void;
  onMove(x: number, y: number): void;
  onUp(x: number, y: number): void;
}
