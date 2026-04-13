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

export type ToolTipValues = ToolTipAngle | ToolTipDelta | ToolTipLength;
