'use client';

import { useState } from "react";
import Branch from "../Branch/Branch";

export interface branch {
    subBranches?: branch[]
    collapsed: Boolean
    title?: String
    description?: String
}

export default function Tree(){
    
    const [tree, setTree] = useState<branch>({collapsed : false})
    
    return (
        <>
            <Branch 
                branch={tree}
            />
        </>
    )
}