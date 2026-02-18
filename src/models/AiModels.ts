import { RGBAobj } from './Tools/Color';

export type Point = {
  x: number;
  y: number;
};

export enum AiActionEnum {
  penStroke = 'penStroke',
  changeCanvasSize = 'changeCanvasSize',
}

export type AiPenStroke = {
  action: AiActionEnum.penStroke;
  layerId: string;
  color: RGBAobj;
  size: number;
  points: Point[];
};

export type AiChangeCanvasSize = {
  action: AiActionEnum.changeCanvasSize;
  width: number;
  height: number;
};

export type AiAction = AiPenStroke | AiChangeCanvasSize;

export type AiResponse = {
  actions: AiAction[];
  planText: string;
};
