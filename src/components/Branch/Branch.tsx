'use client';

import styles from "@/components/Branch/Branch.module.css"
import { useEffect, useState } from "react"
import { branch } from "../Tree/Tree";

export interface branchProps { branch : branch}

export default function Branch(branchProps : branchProps){
    const [subBranches, setSubBranches] = useState<branch[]>(branchProps.branch.subBranches || [])
    const [collapseButtonText, setCollapseButtonText] = useState<String>("^")
    const [collapsed, setCollapsed] = useState<Boolean>(false)

    const collapseOnClick = () : void => {
        setCollapseButtonText(collapsed ? "^" : "v") 
        setCollapsed((prev) => !prev)
    }

    const addBranch = () : void => {
        setSubBranches((prev) => [...prev, {collapsed: false}])
    }
    
    return (
        <>  
            <div className={styles.wholeBranch}>
                <div className={styles.branch}>
                    <button onClick={() => collapseOnClick()}>{collapseButtonText}</button>
                    <input defaultValue={"branch"}></input>  
                </div> 
                {!collapsed && <div className={styles.subBranches}>
                    {subBranches.map((branch) => (
                        <Branch branch={branch}/>       
                    ))}
                    <button onClick={() => addBranch()}>new subbranch</button>
                </div>}
            </div>   
        </>
    )
}