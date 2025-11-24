import styles from '@/components/FileTree/Branch/Branch.module.css';
import { EditableTitle } from './EditableTitle/EditableTitle';
import { CollapseButton } from './CollapseButton/CollapseButton';
import { DragableBranch } from './DragableBranch/DragableBranch';
import { DropSlot } from './DropSlot';

export interface branchProps {
  branch: branch;
  updateTree: (path: number[], branch: branch) => void;
  moveBranch: (dragId: string, targetId: string) => void;
  moveBranchAtIndex: (dragId: string, parentId: string, i: number) => void;
  path: number[];
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export interface branch {
  id: string;
  subBranches: branch[];
  collapsed: boolean;
  title: string;
  description?: string;
}

export default function Branch({
  branch,
  updateTree,
  path,
  moveBranch,
  moveBranchAtIndex,
}: branchProps) {
  const addBranch = (): void => {
    const id = makeId();

    const nextChildren = [
      ...branch.subBranches,
      { id, collapsed: false, subBranches: [], title: id },
    ];
    updateTree(path, { ...branch, subBranches: nextChildren });
  };

  return (
    <>
      <div className={styles.wholeBranch}>
        <div className={styles.branch}>
          <DragableBranch
            nodeId={branch.id}
            onMove={moveBranch}
            dragEnabled={true}
            className={styles.branch}
            overClassName={styles.dropOver}
          >
            <CollapseButton
              expanded={!branch.collapsed}
              controlsId={`children-${branch.id}`}
              onToggle={() => updateTree(path, { ...branch, collapsed: !branch.collapsed })}
            />
            <EditableTitle
              title={branch.title}
              onChange={(title) => updateTree(path, { ...branch, title })}
            />
          </DragableBranch>
        </div>

        {/* SUB BRANCHES */}
        {!branch.collapsed && (
          <div className={styles.subBranches}>
            <DropSlot parentId={branch.id} index={0} onMoveAtIndex={moveBranchAtIndex} />

            {branch.subBranches?.map((subBranch, index) => (
              <div key={subBranch.id}>
                <Branch
                  branch={subBranch}
                  updateTree={updateTree}
                  path={[...path, index]}
                  moveBranch={moveBranch}
                  moveBranchAtIndex={moveBranchAtIndex}
                />
                <DropSlot
                  parentId={branch.id}
                  index={index + 1}
                  onMoveAtIndex={moveBranchAtIndex}
                />
              </div>
            ))}
            <button className={styles.branchAddBranch} onClick={() => addBranch()}>
              <p>Add Sub-branch</p>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
