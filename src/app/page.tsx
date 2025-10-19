import Image from "next/image";
import styles from "./page.module.css";
import Tree from "@/components/FileTree/Tree/Tree";

export default function Home() {
  const test : number = 5
  
  return (
    <>
      <div className={styles.page}>
        <div className={styles.testingCss}>
          <Tree />  
        </div>
      </div>
    </>
  );
}
