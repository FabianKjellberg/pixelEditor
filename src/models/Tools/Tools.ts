export interface ITool {
    onDown(x: number, y: number) : void
    onMove(x: number, y: number) : void
    onUp(x: number, y:number) : void
}