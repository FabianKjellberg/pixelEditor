export type ToolTipAngle = {
  type: 'angle';
  angle: number | undefined;
};

export const createToolTipAngle = (angle: number | undefined): ToolTipAngle => {
  return { type: 'angle', angle: angle != undefined ? Math.round(angle) : undefined };
};

export type ToolTipDelta = {
  type: 'delta';
  dx: number | undefined;
  dy: number | undefined;
};

export const createToolTipDelta = (
  dx: number | undefined,
  dy: number | undefined,
): ToolTipDelta => {
  return {
    type: 'delta',
    dx: dx != undefined ? Math.round(dx) : undefined,
    dy: dy != undefined ? Math.round(dy) : undefined,
  };
};

export type ToolTipLength = {
  type: 'length';
  length: number | undefined;
};

export const createToolTipLength = (length: number | undefined): ToolTipLength => {
  return { type: 'length', length: length != undefined ? Math.round(length) : undefined };
};

export type ToolTipSize = {
  type: 'size';
  width: number | undefined;
  height: number | undefined;
};

export const createToolTipSize = (
  width: number | undefined,
  height: number | undefined,
): ToolTipSize => {
  return {
    type: 'size',
    width: width != undefined ? Math.round(width) : undefined,
    height: height != undefined ? Math.round(height) : undefined,
  };
};

export type ToolTipScale = {
  type: 'scale';
  yScale: number | undefined;
  xScale: number | undefined;
};

export const createToolTipScale = (
  yScale: number | undefined,
  xScale: number | undefined,
): ToolTipScale => {
  return {
    type: 'scale',
    yScale: yScale != undefined ? Math.round(yScale * 100) : undefined,
    xScale: xScale != undefined ? Math.round(xScale * 100) : undefined,
  };
};

export type ToolTipValues =
  | ToolTipAngle
  | ToolTipDelta
  | ToolTipLength
  | ToolTipSize
  | ToolTipScale;
