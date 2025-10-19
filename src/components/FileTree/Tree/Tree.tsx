'use client';

import { useCallback, useEffect, useState } from 'react';
import Branch, { branch } from '../Branch/Branch';

type Branch = branch;

function replaceAtPath(branch: Branch, path: number[], newBranch: Branch): Branch {
  if (path.length === 0) return newBranch;

  const [index, ...rest] = path;
  const children = branch.subBranches;

  if (index < 0 || index >= children.length) return branch;

  const updatedChild = replaceAtPath(children[index], rest, newBranch);

  const nextChildren = children.slice();
  nextChildren[index] = updatedChild;

  return { ...branch, subBranches: nextChildren };
}

function findPathById(node: Branch, id: string, path: number[] = []): number[] | null {
  if (node.id === id) return path;
  for (let i = 0; i < node.subBranches.length; i++) {
    const p = findPathById(node.subBranches[i], id, [...path, i]);
    if (p) return p;
  }
  return null;
}

function isAncestor(root: Branch, ancestorId: string, nodeId: string): boolean {
  const a = findPathById(root, ancestorId);
  const b = findPathById(root, nodeId);
  if (!a || !b || a.length >= b.length) return false;
  return a.every((idx, i) => idx === b[i]);
}

function removeById(node: Branch, id: string): { tree: Branch; removed: Branch } | null {
  for (let i = 0; i < node.subBranches.length; i++) {
    const child = node.subBranches[i];
    if (child.id === id) {
      const nextChildren = node.subBranches.slice();
      nextChildren.splice(i, 1);
      return { tree: { ...node, subBranches: nextChildren }, removed: child };
    }
    const res = removeById(child, id);
    if (res) {
      const nextChildren = node.subBranches.slice();
      nextChildren[i] = res.tree;
      return { tree: { ...node, subBranches: nextChildren }, removed: res.removed };
    }
  }
  return null;
}

function insertChildById(node: Branch, parentId: string, child: Branch): Branch {
  if (node.id === parentId) {
    return { ...node, subBranches: [...node.subBranches, child] };
  }
  return {
    ...node,
    subBranches: node.subBranches.map((c) => insertChildById(c, parentId, child)),
  };
}

function removeAtPath(node: Branch, path: number[]): { tree: Branch; removed: Branch } {
  if (path.length === 0) throw new Error('Cannot remove root');
  const [idx, ...rest] = path;
  const children = node.subBranches;
  const nextChildren = children.slice();

  if (rest.length === 0) {
    const [removed] = nextChildren.splice(idx, 1);
    return { tree: { ...node, subBranches: nextChildren }, removed };
  }

  const childRes = removeAtPath(children[idx], rest);
  nextChildren[idx] = childRes.tree;
  return { tree: { ...node, subBranches: nextChildren }, removed: childRes.removed };
}

function insertAtIndex(node: Branch, parentPath: number[], index: number, child: Branch): Branch {
  if (parentPath.length === 0) {
    const nextChildren = node.subBranches.slice();
    nextChildren.splice(index, 0, child);
    return { ...node, subBranches: nextChildren };
  }
  const [idx, ...rest] = parentPath;
  const nextChildren = node.subBranches.slice();
  nextChildren[idx] = insertAtIndex(node.subBranches[idx], rest, index, child);
  return { ...node, subBranches: nextChildren };
}

export default function Tree() {
  const [tree, setTree] = useState<branch>({
    collapsed: false,
    subBranches: [],
    id: '1',
    title: 'Instance Title',
  });

  const updateTree = useCallback((path: number[], branch: branch): void => {
    setTree((prev) => replaceAtPath(prev, path, branch));
  }, []);

  const moveBranch = useCallback((dragId: string, targetId: string) => {
    setTree((prev) => {
      if (dragId === targetId) return prev; // no-op
      if (prev.id === dragId) return prev; // don't move root (optional)
      if (isAncestor(prev, dragId, targetId)) return prev; // no cycles

      const res = removeById(prev, dragId);
      if (!res) return prev; // dragId not found

      const next = insertChildById(res.tree, targetId, res.removed);
      return next;
    });
  }, []);

  const moveBranchAtIndex = useCallback(
    (dragId: string, parentId: string, index: number) => {
      setTree((prev) => {
        if (prev.id === dragId) return prev;
        if (isAncestor(prev, dragId, parentId) || dragId === parentId) return prev;

        const dragPath = findPathById(prev, dragId);
        const parentPath = findPathById(prev, parentId);
        if (!dragPath || !parentPath) return prev;

        const { tree: withoutDrag, removed } = removeAtPath(prev, dragPath);

        const sameParent =
          dragPath.length > 0 &&
          parentPath.length === dragPath.length - 1 &&
          parentPath.every((v, i) => v === dragPath[i]);

        const originalIndex = dragPath[dragPath.length - 1];
        const adjustedIndex = sameParent && originalIndex < index ? index - 1 : index;

        const targetParentNodePath = findPathById(withoutDrag, parentId)!;
        let maxLen = (() => {
          let node = withoutDrag;
          for (const i of targetParentNodePath) node = node.subBranches[i];
          return node.subBranches.length;
        })();
        const safeIndex = Math.max(0, Math.min(adjustedIndex, maxLen));

        const next = insertAtIndex(withoutDrag, targetParentNodePath, safeIndex, removed);
        return next;
      });
    },
    [setTree],
  );

  return (
    <>
      <Branch
        branch={tree}
        updateTree={updateTree}
        path={[]}
        moveBranch={moveBranch}
        moveBranchAtIndex={moveBranchAtIndex}
      />
    </>
  );
}
