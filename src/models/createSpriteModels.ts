export interface layer{
    xPos: number
    yPos: number
    width: number
    height: number

    pixels: pixel[][]
}

export interface pixel {
    xPos: number
    yPos: number
    hex: string
}