import SpriteCanvas from "@/components/SpriteCanvas/SpriteCanvas"
import styles from "./page.module.css"
import type { layer } from "@/models/createSpriteModels"

const mockLayers : layer[] = []

const CreateSprite = () => {

    return (
        <>
            <div className={styles.createSprite}>
                <div className={styles.spriteCanvas}>
                    <SpriteCanvas layers={mockLayers}/>
                </div>
            </div>
            
        </>
    )

}
export default CreateSprite