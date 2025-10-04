import type { layer } from "@/models/createSpriteModels"

interface spriteCanvasProps {
    layers: layer[]
}

const SpriteCanvas = ({layers} : spriteCanvasProps) => {
    
    return (
        <>
            <canvas>

            </canvas>
        </>
    )
}
export default SpriteCanvas