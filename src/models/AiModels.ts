import { RGBAobj } from './Tools/Color';

export type Point = {
  x: number;
  y: number;
};

export enum AiActionEnum {
  penStroke = 'penStroke',
  lineTool = 'lineTool',
  rectangleTool = 'rectangleTool',
  ellipseTool = 'ellipseTool',
  fillBucket = 'fillBucket',
  changeCanvasSize = 'changeCanvasSize',
}

export type AiPenStroke = {
  action: AiActionEnum.penStroke;
  layerId: string;
  color: RGBAobj;
  size: number;
  points: Point[];
  opacity: number;
};

export type AiLineTool = {
  action: AiActionEnum.lineTool;
  layerId: string;
  color: RGBAobj;
  strokeWidth: number;
  opacity: number;
  from: Point;
  to: Point;
};

export type AiRectangleTool = {
  action: AiActionEnum.rectangleTool;
  layerId: string;
  color: RGBAobj;
  fill: boolean;
  fillColor: RGBAobj;
  strokeWidth: number;
  opacity: number;
  from: Point;
  to: Point;
};

export type AiEllipseTool = {
  action: AiActionEnum.ellipseTool;
  layerId: string;
  color: RGBAobj;
  fill: boolean;
  fillColor: RGBAobj;
  strokeWidth: number;
  opacity: number;
  from: Point;
  to: Point;
};

export type AiFillBucket = {
  action: AiActionEnum.fillBucket;
  layerId: string;
  color: RGBAobj;
  opacity: number;
  x: number;
  y: number;
};

export type AiChangeCanvasSize = {
  action: AiActionEnum.changeCanvasSize;
  width: number;
  height: number;
};

export type AiAction =
  | AiPenStroke
  | AiLineTool
  | AiRectangleTool
  | AiEllipseTool
  | AiFillBucket
  | AiChangeCanvasSize;

export type AiResponse = {
  actions: AiAction[];
  planText: string;
};

export type MessageItem = {
  message: string;
  fromUser: boolean;
};
