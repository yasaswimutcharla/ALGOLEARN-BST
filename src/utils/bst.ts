import { BSTNode, TraversalType, DropSlot, TreeComparisonResult, SlotValidationResult } from '../types';

let nodeIdCounter = 1;
export const getNextId = () => `node-${nodeIdCounter++}`;

export function resetNodeIdCounter() {
  nodeIdCounter = 1;
}

export function createNode(value: number): BSTNode {
  return {
    id: getNextId(),
    value,
    left: null,
    right: null,
    highlight: 'default',
  };
}

/**
 * Inserts a value into a standard BST
 */
export function insertNode(root: BSTNode | null, value: number): BSTNode {
  if (!root) {
    return createNode(value);
  }
  if (value < root.value) {
    root.left = insertNode(root.left || null, value);
  } else if (value > root.value) {
    root.right = insertNode(root.right || null, value);
  }
  return root;
}

/**
 * Builds a BST from an array of numbers
 */
export function buildTreeFromValues(values: number[]): BSTNode | null {
  resetNodeIdCounter();
  let root: BSTNode | null = null;
  for (const val of values) {
    root = insertNode(root, val);
  }
  return root;
}

/**
 * Deep clones a BST
 */
export function cloneTree(root: BSTNode | null): BSTNode | null {
  if (!root) return null;
  return {
    id: root.id,
    value: root.value,
    highlight: root.highlight,
    x: root.x,
    y: root.y,
    isEmptySlot: root.isEmptySlot,
    label: root.label,
    expectedReplacement: root.expectedReplacement,
    left: cloneTree(root.left || null),
    right: cloneTree(root.right || null),
  };
}

/**
 * Measures tree height (edges from root to lowest leaf, or 0 if empty, 1 if single node)
 */
export function getTreeHeight(root: BSTNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(getTreeHeight(root.left || null), getTreeHeight(root.right || null));
}

/**
 * Measures node depth from root
 */
export function getNodeDepth(root: BSTNode | null, targetVal: number, currentDepth = 0): number {
  if (!root) return -1;
  if (root.value === targetVal) return currentDepth;
  if (targetVal < root.value) return getNodeDepth(root.left || null, targetVal, currentDepth + 1);
  return getNodeDepth(root.right || null, targetVal, currentDepth + 1);
}

/**
 * Counts total nodes
 */
export function countNodes(root: BSTNode | null): number {
  if (!root) return 0;
  return 1 + countNodes(root.left || null) + countNodes(root.right || null);
}

/**
 * Finds minimum value node in BST
 */
export function findMinNode(root: BSTNode | null): BSTNode | null {
  if (!root) return null;
  let current: BSTNode = root;
  while (current.left) {
    current = current.left;
  }
  return current;
}

/**
 * Finds maximum value node in BST
 */
export function findMaxNode(root: BSTNode | null): BSTNode | null {
  if (!root) return null;
  let current: BSTNode = root;
  while (current.right) {
    current = current.right;
  }
  return current;
}

/**
 * Finds Inorder Successor (the smallest value in the right subtree, or lowest ancestor whose left child is also an ancestor)
 */
export function findInorderSuccessor(root: BSTNode | null, targetVal: number): BSTNode | null {
  if (!root) return null;
  let current: BSTNode | null = root;
  let successor: BSTNode | null = null;

  while (current) {
    if (targetVal < current.value) {
      successor = current;
      current = current.left || null;
    } else if (targetVal > current.value) {
      current = current.right || null;
    } else {
      if (current.right) {
        successor = findMinNode(current.right);
      }
      break;
    }
  }
  return successor;
}

/**
 * Finds Inorder Predecessor (the largest value in the left subtree, or lowest ancestor whose right child is an ancestor)
 */
export function findInorderPredecessor(root: BSTNode | null, targetVal: number): BSTNode | null {
  if (!root) return null;
  let current: BSTNode | null = root;
  let predecessor: BSTNode | null = null;

  while (current) {
    if (targetVal > current.value) {
      predecessor = current;
      current = current.right || null;
    } else if (targetVal < current.value) {
      current = current.left || null;
    } else {
      if (current.left) {
        predecessor = findMaxNode(current.left);
      }
      break;
    }
  }
  return predecessor;
}

/**
 * Returns path of nodes compared when searching for targetVal
 */
export function getSearchPath(root: BSTNode | null, targetVal: number): { path: BSTNode[]; found: boolean } {
  const path: BSTNode[] = [];
  let current: BSTNode | null = root;
  let found = false;

  while (current) {
    path.push(current);
    if (current.value === targetVal) {
      found = true;
      break;
    } else if (targetVal < current.value) {
      current = current.left || null;
    } else {
      current = current.right || null;
    }
  }
  return { path, found };
}

/**
 * Deletes a node and returns new root, plus details on how it was deleted
 */
export function deleteNodeWithCase(
  root: BSTNode | null,
  value: number
): {
  newRoot: BSTNode | null;
  deleted: boolean;
  caseType: 'leaf' | 'single-child' | 'two-children' | 'not-found';
  successorValue?: number;
} {
  let deleted = false;
  let caseType: 'leaf' | 'single-child' | 'two-children' | 'not-found' = 'not-found';
  let successorVal: number | undefined;

  function del(node: BSTNode | null, val: number): BSTNode | null {
    if (!node) return null;

    if (val < node.value) {
      node.left = del(node.left || null, val);
    } else if (val > node.value) {
      node.right = del(node.right || null, val);
    } else {
      deleted = true;
      // Case 1: Leaf node (No children)
      if (!node.left && !node.right) {
        caseType = 'leaf';
        return null;
      }
      // Case 2: One child
      if (!node.left) {
        caseType = 'single-child';
        return node.right || null;
      }
      if (!node.right) {
        caseType = 'single-child';
        return node.left || null;
      }
      // Case 3: Two children
      caseType = 'two-children';
      const minRight = findMinNode(node.right);
      if (minRight) {
        node.value = minRight.value;
        successorVal = minRight.value;
        node.right = del(node.right, minRight.value);
      }
    }
    return node;
  }

  const cloned = cloneTree(root);
  const newRoot = del(cloned, value);
  return { newRoot, deleted, caseType, successorValue: successorVal };
}

/**
 * Traversal Generators
 */
export function getInorder(root: BSTNode | null): number[] {
  const result: number[] = [];
  function traverse(n: BSTNode | null) {
    if (!n) return;
    traverse(n.left || null);
    result.push(n.value);
    traverse(n.right || null);
  }
  traverse(root);
  return result;
}

export function getPreorder(root: BSTNode | null): number[] {
  const result: number[] = [];
  function traverse(n: BSTNode | null) {
    if (!n) return;
    result.push(n.value);
    traverse(n.left || null);
    traverse(n.right || null);
  }
  traverse(root);
  return result;
}

export function getPostorder(root: BSTNode | null): number[] {
  const result: number[] = [];
  function traverse(n: BSTNode | null) {
    if (!n) return;
    traverse(n.left || null);
    traverse(n.right || null);
    result.push(n.value);
  }
  traverse(root);
  return result;
}

export function getLevelOrder(root: BSTNode | null): number[] {
  if (!root) return [];
  const result: number[] = [];
  const queue: BSTNode[] = [root];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    result.push(curr.value);
    if (curr.left) queue.push(curr.left);
    if (curr.right) queue.push(curr.right);
  }
  return result;
}

export function getTraversalList(root: BSTNode | null, type: TraversalType): number[] {
  switch (type) {
    case 'inorder':
      return getInorder(root);
    case 'preorder':
      return getPreorder(root);
    case 'postorder':
      return getPostorder(root);
    case 'levelorder':
      return getLevelOrder(root);
  }
}

/**
 * Calculates 2D coordinates for rendering the BST on SVG/Canvas nicely
 */
export function layoutTree(
  root: BSTNode | null,
  width = 650,
  topOffset = 50,
  levelHeight = 70
): { root: BSTNode | null; totalWidth: number; totalHeight: number } {
  if (!root) return { root: null, totalWidth: width, totalHeight: 100 };

  const cloned = cloneTree(root);
  if (!cloned) return { root: null, totalWidth: width, totalHeight: 100 };

  const depth = getTreeHeight(cloned);
  const totalHeight = Math.max(260, (depth + 1) * levelHeight + topOffset);

  function assignPositions(
    node: BSTNode | null,
    x: number,
    y: number,
    spread: number,
    level: number
  ) {
    if (!node) return;
    node.x = x;
    node.y = y;

    const nextSpread = Math.max(30, spread / 2);
    if (node.left) {
      assignPositions(node.left, x - spread, y + levelHeight, nextSpread, level + 1);
    }
    if (node.right) {
      assignPositions(node.right, x + spread, y + levelHeight, nextSpread, level + 1);
    }
  }

  const initialSpread = Math.max(50, Math.min(width / 3.8, 160));
  assignPositions(cloned, width / 2, topOffset, initialSpread, 0);

  return { root: cloned, totalWidth: width, totalHeight };
}

/**
 * Computes all available drop positions in the current tree layout.
 * When the tree is empty, returns 1 root slot.
 * When nodes exist, returns open left/right child slots for every node.
 */
export function getAvailableDropSlots(
  root: BSTNode | null,
  width = 650,
  topOffset = 50,
  levelHeight = 70
): DropSlot[] {
  const slots: DropSlot[] = [];

  if (!root) {
    slots.push({
      id: 'slot-root',
      parentId: null,
      direction: 'root',
      x: width / 2,
      y: topOffset,
    });
    return slots;
  }

  const { root: laidOutRoot } = layoutTree(root, width, topOffset, levelHeight);
  if (!laidOutRoot) return slots;

  function findSlots(node: BSTNode, spread: number, level: number) {
    if (node.x === undefined || node.y === undefined) return;
    const nextSpread = Math.max(30, spread / 2);

    if (!node.left) {
      slots.push({
        id: `slot-${node.id}-left`,
        parentId: node.id,
        direction: 'left',
        x: node.x - spread,
        y: node.y + levelHeight,
        parentValue: node.value,
      });
    } else {
      findSlots(node.left, nextSpread, level + 1);
    }

    if (!node.right) {
      slots.push({
        id: `slot-${node.id}-right`,
        parentId: node.id,
        direction: 'right',
        x: node.x + spread,
        y: node.y + levelHeight,
        parentValue: node.value,
      });
    } else {
      findSlots(node.right, nextSpread, level + 1);
    }
  }

  const initialSpread = Math.max(50, Math.min(width / 3.8, 160));
  findSlots(laidOutRoot, initialSpread, 0);

  return slots;
}

/**
 * Checks if a slot parent node exists within a given subtree
 */
export function isSlotInSubtree(subtreeRoot: BSTNode | null, slotParentId: string | null): boolean {
  if (!subtreeRoot || !slotParentId) return false;
  if (subtreeRoot.id === slotParentId) return true;
  return (
    isSlotInSubtree(subtreeRoot.left || null, slotParentId) ||
    isSlotInSubtree(subtreeRoot.right || null, slotParentId)
  );
}

/**
 * Finds the single correct drop slot for a value in a BST
 */
export function getCorrectDropSlot(
  root: BSTNode | null
, value: number): {
  parentId: string | null;
  direction: 'root' | 'left' | 'right';
  parentValue?: number;
} {
  if (!root) {
    return { parentId: null, direction: 'root' };
  }
  let curr: BSTNode = root;
  while (curr) {
    if (value < curr.value) {
      if (!curr.left) {
        return { parentId: curr.id, direction: 'left', parentValue: curr.value };
      }
      curr = curr.left;
    } else if (value > curr.value) {
      if (!curr.right) {
        return { parentId: curr.id, direction: 'right', parentValue: curr.value };
      }
      curr = curr.right;
    } else {
      break;
    }
  }
  return { parentId: curr.id, direction: 'left', parentValue: curr.value };
}

/**
 * Validates a student's chosen drop slot against the strict BST ordering rules.
 * Returns pedagogical feedback explaining WHY it is valid or invalid.
 */
export function validateDropSlot(
  root: BSTNode | null,
  slot: DropSlot,
  value: number
): SlotValidationResult {
  // Case 1: Empty Tree
  if (!root) {
    if (slot.direction === 'root' || slot.parentId === null) {
      return {
        isValid: true,
        explanation: `Correct! Placed ${value} as the Root node.`,
        expectedDirection: 'root',
        comparisonRule: 'Root node',
        correctSlot: { parentId: null, direction: 'root' },
      };
    }
    return {
      isValid: false,
      explanation: `Not here! The tree is empty, so ${value} must be placed as the Root node.`,
      expectedDirection: 'root',
      comparisonRule: 'Empty tree requires root',
      correctSlot: { parentId: null, direction: 'root' },
    };
  }

  // Case 2: Non-empty tree - trace binary search path from Root down to find the correct slot
  let curr: BSTNode | null = root;
  const correctSlot = getCorrectDropSlot(root, value);

  while (curr) {
    if (value < curr.value) {
      // 1. If dropped directly on the right of this node
      if (slot.parentId === curr.id && slot.direction === 'right') {
        return {
          isValid: false,
          explanation: `Not here! ${value} is smaller than ${curr.value} (${value} < ${curr.value}), so smaller values must go to the LEFT.`,
          expectedDirection: 'left',
          expectedParentValue: curr.value,
          comparisonRule: `${value} < ${curr.value} → GO LEFT`,
          correctSlot,
        };
      }

      // 2. If dropped somewhere in the right subtree of this node
      if (isSlotInSubtree(curr.right || null, slot.parentId)) {
        return {
          isValid: false,
          explanation: `Not here! ${value} is smaller than ${curr.value} (${value} < ${curr.value}), so it belongs in the LEFT subtree of ${curr.value}, not on the right.`,
          expectedDirection: 'left',
          expectedParentValue: curr.value,
          comparisonRule: `${value} < ${curr.value} → GO LEFT`,
          correctSlot,
        };
      }

      // 3. If left child is empty, this node's left is the ONLY valid slot
      if (!curr.left) {
        if (slot.parentId === curr.id && slot.direction === 'left') {
          return {
            isValid: true,
            explanation: `Correct! ${value} < ${curr.value}, so ${value} goes LEFT.`,
            expectedDirection: 'left',
            expectedParentValue: curr.value,
            comparisonRule: `${value} < ${curr.value} → LEFT`,
            correctSlot,
          };
        } else {
          return {
            isValid: false,
            explanation: `Not here! ${value} is smaller than ${curr.value} (${value} < ${curr.value}), so attach ${value} as the LEFT child of ${curr.value}.`,
            expectedDirection: 'left',
            expectedParentValue: curr.value,
            comparisonRule: `${value} < ${curr.value} → LEFT of ${curr.value}`,
            correctSlot,
          };
        }
      }

      // Recurse left
      curr = curr.left;
    } else if (value > curr.value) {
      // 1. If dropped directly on the left of this node
      if (slot.parentId === curr.id && slot.direction === 'left') {
        return {
          isValid: false,
          explanation: `Not here! ${value} is greater than ${curr.value} (${value} > ${curr.value}), so greater values must go to the RIGHT.`,
          expectedDirection: 'right',
          expectedParentValue: curr.value,
          comparisonRule: `${value} > ${curr.value} → GO RIGHT`,
          correctSlot,
        };
      }

      // 2. If dropped somewhere in the left subtree of this node
      if (isSlotInSubtree(curr.left || null, slot.parentId)) {
        return {
          isValid: false,
          explanation: `Not here! ${value} is greater than ${curr.value} (${value} > ${curr.value}), so it must go to the RIGHT of ${curr.value}.`,
          expectedDirection: 'right',
          expectedParentValue: curr.value,
          comparisonRule: `${value} > ${curr.value} → GO RIGHT`,
          correctSlot,
        };
      }

      // 3. If right child is empty, this node's right is the ONLY valid slot
      if (!curr.right) {
        if (slot.parentId === curr.id && slot.direction === 'right') {
          return {
            isValid: true,
            explanation: `Correct! ${value} > ${curr.value}, so ${value} goes RIGHT.`,
            expectedDirection: 'right',
            expectedParentValue: curr.value,
            comparisonRule: `${value} > ${curr.value} → RIGHT`,
            correctSlot,
          };
        } else {
          return {
            isValid: false,
            explanation: `Not here! ${value} is greater than ${curr.value} (${value} > ${curr.value}), so attach ${value} as the RIGHT child of ${curr.value}.`,
            expectedDirection: 'right',
            expectedParentValue: curr.value,
            comparisonRule: `${value} > ${curr.value} → RIGHT of ${curr.value}`,
            correctSlot,
          };
        }
      }

      // Recurse right
      curr = curr.right;
    } else {
      return {
        isValid: false,
        explanation: `Value ${value} is already present in this tree. Binary Search Trees do not hold duplicate values.`,
        comparisonRule: 'No duplicates',
        correctSlot,
      };
    }
  }

  return {
    isValid: false,
    explanation: `Not here! Compare ${value} starting from the Root: smaller values go Left, larger values go Right.`,
    correctSlot,
  };
}

/**
 * Attaches a new node at a specific chosen slot in the tree
 */
export function attachNodeAtSlot(root: BSTNode | null, slot: DropSlot, value: number): BSTNode {
  const newNode = createNode(value);
  if (!root || slot.direction === 'root' || !slot.parentId) {
    return newNode;
  }
  const cloned = cloneTree(root)!;
  function attach(node: BSTNode): boolean {
    if (node.id === slot.parentId) {
      if (slot.direction === 'left') {
        node.left = newNode;
      } else if (slot.direction === 'right') {
        node.right = newNode;
      }
      return true;
    }
    if (node.left && attach(node.left)) return true;
    if (node.right && attach(node.right)) return true;
    return false;
  }
  attach(cloned);
  return cloned;
}

/**
 * Removes a specific node by ID from a student's constructed tree and collects
 * all removed node values so they can be returned back to the tray.
 */
export function removeNodeFromConstructedTree(
  root: BSTNode | null,
  nodeId: string
): { newRoot: BSTNode | null; removedValues: number[] } {
  if (!root) return { newRoot: null, removedValues: [] };
  const removedValues: number[] = [];

  function collectSubtreeValues(node: BSTNode | null) {
    if (!node) return;
    removedValues.push(node.value);
    collectSubtreeValues(node.left || null);
    collectSubtreeValues(node.right || null);
  }

  if (root.id === nodeId) {
    collectSubtreeValues(root);
    return { newRoot: null, removedValues };
  }

  const cloned = cloneTree(root)!;

  function prune(parent: BSTNode): boolean {
    if (parent.left && parent.left.id === nodeId) {
      collectSubtreeValues(parent.left);
      parent.left = null;
      return true;
    }
    if (parent.right && parent.right.id === nodeId) {
      collectSubtreeValues(parent.right);
      parent.right = null;
      return true;
    }
    if (parent.left && prune(parent.left)) return true;
    if (parent.right && prune(parent.right)) return true;
    return false;
  }

  prune(cloned);
  return { newRoot: cloned, removedValues };
}

/**
 * Validates whether a tree satisfies the BST property.
 * Returns valid status and array of invalid node IDs if any.
 */
export function validateBST(root: BSTNode | null): {
  isValid: boolean;
  invalidNodeIds: string[];
  reason?: string;
} {
  const invalidIds: string[] = [];
  let reason: string | undefined;

  function helper(
    node: BSTNode | null,
    min: number | null,
    max: number | null,
    minNodeVal?: number,
    maxNodeVal?: number
  ): boolean {
    if (!node) return true;

    if (min !== null && node.value <= min) {
      invalidIds.push(node.id);
      if (!reason) {
        reason = `Node ${node.value} is in the right subtree of ${minNodeVal}, but is ≤ ${min}. All right descendants must be strictly greater!`;
      }
      return false;
    }

    if (max !== null && node.value >= max) {
      invalidIds.push(node.id);
      if (!reason) {
        reason = `Node ${node.value} is in the left subtree of ${maxNodeVal}, but is ≥ ${max}. All left descendants must be strictly smaller!`;
      }
      return false;
    }

    const leftOk = helper(node.left || null, min, node.value, minNodeVal, node.value);
    const rightOk = helper(node.right || null, node.value, max, node.value, maxNodeVal);
    return leftOk && rightOk;
  }

  const isValid = helper(root, null, null);
  return { isValid, invalidNodeIds: invalidIds, reason };
}

/**
 * Checks if a BST is height-balanced (difference <= 1 at every node)
 */
export function isTreeBalanced(root: BSTNode | null): boolean {
  function check(node: BSTNode | null): number {
    if (!node) return 0;
    const leftH = check(node.left || null);
    if (leftH === -1) return -1;
    const rightH = check(node.right || null);
    if (rightH === -1) return -1;
    if (Math.abs(leftH - rightH) > 1) return -1;
    return 1 + Math.max(leftH, rightH);
  }
  return check(root) !== -1;
}

export const isBalanced = isTreeBalanced;

/**
 * Traversal aliases
 */
export function inorderTraversal(root: BSTNode | null): number[] {
  return getInorder(root);
}

export function preorderTraversal(root: BSTNode | null): number[] {
  return getPreorder(root);
}

export function postorderTraversal(root: BSTNode | null): number[] {
  return getPostorder(root);
}

/**
 * Compares a student-built tree against an expected BST
 * Supports passing either expectedValues array OR an expected BSTNode root!
 */
export function compareTrees(
  studentRoot: BSTNode | null,
  expectedTarget: number[] | BSTNode | null
): TreeComparisonResult {
  const expectedValues: number[] = Array.isArray(expectedTarget)
    ? expectedTarget
    : getInorder(expectedTarget);

  const expectedRoot: BSTNode | null = Array.isArray(expectedTarget)
    ? buildTreeFromValues(expectedTarget)
    : expectedTarget;

  const totalExpected = expectedValues.length;
  const incorrectIds: string[] = [];
  const correctIds: string[] = [];
  const errors: TreeComparisonResult['errors'] = [];

  const bstCheck = validateBST(studentRoot);
  const studentInorder = getInorder(studentRoot);

  // Check missing values
  for (const expectedVal of expectedValues) {
    if (!studentInorder.includes(expectedVal)) {
      errors.push({
        nodeValue: expectedVal,
        type: 'missing',
        message: `Value ${expectedVal} is missing from the tree.`,
        suggestedAction: `Drag number ${expectedVal} into the tree.`,
      });
    }
  }

  // Check extra values
  for (const studentVal of studentInorder) {
    if (!expectedValues.includes(studentVal)) {
      errors.push({
        nodeValue: studentVal,
        type: 'extra',
        message: `Value ${studentVal} does not belong in this challenge.`,
        suggestedAction: `Remove ${studentVal} from the tree.`,
      });
    }
  }

  // Structural comparison
  function compareNodes(sNode: BSTNode | null, eNode: BSTNode | null, parentVal?: number, dir?: 'left' | 'right') {
    if (!sNode && !eNode) return;

    if (!sNode && eNode) {
      return;
    }

    if (sNode && !eNode) {
      incorrectIds.push(sNode.id);
      errors.push({
        nodeValue: sNode.value,
        type: 'wrong_parent',
        message: `Node ${sNode.value} is placed incorrectly on the ${dir} of ${parentVal}.`,
        suggestedAction: `Reposition node ${sNode.value} to its correct BST position.`,
      });
      return;
    }

    if (sNode && eNode) {
      if (sNode.value === eNode.value) {
        correctIds.push(sNode.id);
      } else {
        incorrectIds.push(sNode.id);
        errors.push({
          nodeValue: sNode.value,
          type: 'wrong_subtree',
          message: `At position where ${eNode.value} was expected, found ${sNode.value}.`,
          suggestedAction: `Check whether ${sNode.value} should go left or right.`,
        });
      }
      compareNodes(sNode.left || null, eNode.left || null, sNode.value, 'left');
      compareNodes(sNode.right || null, eNode.right || null, sNode.value, 'right');
    }
  }

  compareNodes(studentRoot, expectedRoot);

  const isExactMatch =
    errors.length === 0 &&
    incorrectIds.length === 0 &&
    correctIds.length === totalExpected &&
    bstCheck.isValid;

  const firstError = errors[0];
  const errorMessage = !isExactMatch
    ? firstError?.message || (!bstCheck.isValid ? bstCheck.reason : 'Tree structure does not match expected solution.')
    : 'All nodes and subtree arrangements are 100% correct!';

  return {
    isMatch: isExactMatch,
    isCorrect: isExactMatch,
    isValidBST: bstCheck.isValid,
    matchedCount: correctIds.length,
    totalExpected,
    errorMessage,
    errors,
    incorrectNodeIds: incorrectIds,
    correctNodeIds: correctIds,
  };
}

/**
 * Flatten all nodes and edges for rendering
 */
export interface FlattenedTree {
  nodes: (BSTNode & { x: number; y: number })[];
  edges: {
    from: { x: number; y: number; id: string };
    to: { x: number; y: number; id: string };
    direction: 'left' | 'right';
  }[];
}

export function flattenTree(root: BSTNode | null): FlattenedTree {
  const nodes: (BSTNode & { x: number; y: number })[] = [];
  const edges: FlattenedTree['edges'] = [];

  function traverse(node: BSTNode | null) {
    if (!node || node.x === undefined || node.y === undefined) return;
    nodes.push(node as BSTNode & { x: number; y: number });

    if (node.left && node.left.x !== undefined && node.left.y !== undefined) {
      edges.push({
        from: { x: node.x, y: node.y, id: node.id },
        to: { x: node.left.x, y: node.left.y, id: node.left.id },
        direction: 'left',
      });
      traverse(node.left);
    }

    if (node.right && node.right.x !== undefined && node.right.y !== undefined) {
      edges.push({
        from: { x: node.x, y: node.y, id: node.id },
        to: { x: node.right.x, y: node.right.y, id: node.right.id },
        direction: 'right',
      });
      traverse(node.right);
    }
  }

  traverse(root);
  return { nodes, edges };
}
