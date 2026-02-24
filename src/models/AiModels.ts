export type Point = {
  x: number;
  y: number;
};

export type AiResponse = {
  actions: AiToolCall[];
  intent: 'DRAW' | 'CHAT' | 'CLARIFY';
  shouldCallTools: boolean;
  message: string;
};

export type MessageItem = {
  message: string;
  fromUser: boolean;
};

export type RGBobj = { r: number; g: number; b: number };

export type AiToolCall =
  | {
      tool: 'penStroke';
      args: { layerId: string; color: RGBobj; size: number; points: Point[]; opacity: number };
    }
  | {
      tool: 'lineTool';
      args: {
        layerId: string;
        color: RGBobj;
        strokeWidth: number;
        opacity: number;
        from: Point;
        to: Point;
      };
    }
  | {
      tool: 'rectangleTool';
      args: {
        layerId: string;
        color: RGBobj;
        fill: boolean;
        fillColor: RGBobj;
        strokeWidth: number;
        opacity: number;
        from: Point;
        to: Point;
      };
    }
  | {
      tool: 'ellipseTool';
      args: {
        layerId: string;
        color: RGBobj;
        fill: boolean;
        fillColor: RGBobj;
        strokeWidth: number;
        opacity: number;
        from: Point;
        to: Point;
      };
    }
  | {
      tool: 'fillBucket';
      args: { layerId: string; color: RGBobj; opacity: number; x: number; y: number };
    }
  | { tool: 'changeCanvasSize'; args: { width: number; height: number } }
  | {
      tool: 'gradientTool';
      args: {
        layerId: string;
        color: RGBobj;
        toColor: RGBobj;
        opacity: number;
        singleColor: boolean;
        gradientType: string;
        from: Point;
        to: Point;
      };
    }
  | {
      tool: 'freeformTool';
      args: {
        layerId: string;
        color: RGBobj;
        fillColor: RGBobj;
        fill: boolean;
        strokeWidth: number;
        opacity: number;
        points: Point[];
      };
    };
