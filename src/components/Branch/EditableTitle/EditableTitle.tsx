import { useEffect, useRef, useState } from "react";
import styles from "@/components/Branch/EditableTitle/EditableTitle.module.css"
import React from "react";

interface editableTitleProps {
    title: string
    onChange: (v:string) => void
}

export const EditableTitle = React.memo(function EditableTitle({title, onChange} :editableTitleProps) {

    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (isEditing) {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
    }, [isEditing]);
    
    return (
        <input
            ref={inputRef}
            readOnly={!isEditing}
            value={title}
            onDoubleClick={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}        
            onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur(); 
                if (e.key === "Escape") (e.target as HTMLInputElement).blur();
            }}
            onChange={(e) => onChange(e.target.value)}
            className={isEditing ? styles.inputEditing : styles.inputReadOnly}
        />
    )
})