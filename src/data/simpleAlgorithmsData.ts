export interface SimpleAlgorithmStep {
  stepNumber: number;
  text: string;
}

export interface SimpleAlgorithmData {
  topicNumber?: number;
  title: string;
  rule?: string;
  steps: SimpleAlgorithmStep[];
}

export const TOPIC_SIMPLE_ALGORITHMS: Record<number, SimpleAlgorithmData> = {
  // Topic 1: What is a Tree?
  1: {
    topicNumber: 1,
    title: 'WHAT IS A TREE',
    steps: [
      { stepNumber: 1, text: 'Start at the single root node.' },
      { stepNumber: 2, text: 'Follow the edges connecting downward.' },
      { stepNumber: 3, text: 'Reach the leaf nodes at the bottom.' },
      { stepNumber: 4, text: 'Confirm there are no loops or cycles.' },
    ],
  },

  // Topic 2: What is a Binary Tree?
  2: {
    topicNumber: 2,
    title: 'WHAT IS A BINARY TREE',
    rule: 'At most 2 children per node',
    steps: [
      { stepNumber: 1, text: 'Check the root node.' },
      { stepNumber: 2, text: 'Check its left and right children.' },
      { stepNumber: 3, text: 'Confirm each node has at most 2 children.' },
      { stepNumber: 4, text: 'Verify this rule holds for all nodes.' },
    ],
  },

  // Topic 3: What is a BST? / Build a BST
  3: {
    topicNumber: 3,
    title: 'BUILD A BST FROM NUMBERS',
    rule: 'Left < Root < Right',
    steps: [
      { stepNumber: 1, text: 'Take the first number.' },
      { stepNumber: 2, text: 'Make it the root.' },
      { stepNumber: 3, text: 'Take the next number.' },
      { stepNumber: 4, text: 'Compare it with the current node.' },
      { stepNumber: 5, text: 'Move left if it is smaller.' },
      { stepNumber: 6, text: 'Move right if it is larger.' },
      { stepNumber: 7, text: 'Place it in the empty position.' },
      { stepNumber: 8, text: 'Repeat for the remaining numbers.' },
    ],
  },

  // Topic 4: BST Property / Check whether a tree is a BST
  4: {
    topicNumber: 4,
    title: 'CHECK WHETHER A TREE IS A BST',
    rule: 'Left < Root < Right for EVERY subtree',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Check the left subtree.' },
      { stepNumber: 3, text: 'All left values must be smaller.' },
      { stepNumber: 4, text: 'Check the right subtree.' },
      { stepNumber: 5, text: 'All right values must be larger.' },
      { stepNumber: 6, text: 'Repeat for every node.' },
      { stepNumber: 7, text: 'If all rules are followed, it is a valid BST.' },
    ],
  },

  // Topic 5: The Root Node
  5: {
    topicNumber: 5,
    title: 'FIND THE ROOT NODE',
    steps: [
      { stepNumber: 1, text: 'Look at the top node.' },
      { stepNumber: 2, text: 'Check whether it has a parent.' },
      { stepNumber: 3, text: 'If it has no parent, it is the root.' },
    ],
  },

  // Topic 6: Parent Node
  6: {
    topicNumber: 6,
    title: 'FIND PARENT AND CHILD',
    steps: [
      { stepNumber: 1, text: 'Select a node.' },
      { stepNumber: 2, text: 'Look at the node directly above it.' },
      { stepNumber: 3, text: 'That node is the parent.' },
      { stepNumber: 4, text: 'Look at the nodes directly below it.' },
      { stepNumber: 5, text: 'Those nodes are the children.' },
    ],
  },

  // Topic 7: Child Node
  7: {
    topicNumber: 7,
    title: 'FIND PARENT AND CHILD',
    steps: [
      { stepNumber: 1, text: 'Select a node.' },
      { stepNumber: 2, text: 'Look at the node directly above it.' },
      { stepNumber: 3, text: 'That node is the parent.' },
      { stepNumber: 4, text: 'Look at the nodes directly below it.' },
      { stepNumber: 5, text: 'Those nodes are the children.' },
    ],
  },

  // Topic 8: Leaf Node
  8: {
    topicNumber: 8,
    title: 'FIND A LEAF NODE',
    steps: [
      { stepNumber: 1, text: 'Select a node.' },
      { stepNumber: 2, text: 'Check its left child.' },
      { stepNumber: 3, text: 'Check its right child.' },
      { stepNumber: 4, text: 'If both are empty, it is a leaf node.' },
    ],
  },

  // Topic 9: Internal Node
  9: {
    topicNumber: 9,
    title: 'FIND AN INTERNAL NODE',
    steps: [
      { stepNumber: 1, text: 'Select a node.' },
      { stepNumber: 2, text: 'Check its left and right children.' },
      { stepNumber: 3, text: 'If it has at least one child, it is an internal node.' },
    ],
  },

  // Topic 10: Left Subtree
  10: {
    topicNumber: 10,
    title: 'FIND LEFT SUBTREE',
    rule: 'All values < Root',
    steps: [
      { stepNumber: 1, text: 'Start at the node.' },
      { stepNumber: 2, text: 'Move to its left child.' },
      { stepNumber: 3, text: 'Include all descendants connected underneath.' },
      { stepNumber: 4, text: 'Verify all values are smaller than the node.' },
    ],
  },

  // Topic 11: Right Subtree
  11: {
    topicNumber: 11,
    title: 'FIND RIGHT SUBTREE',
    rule: 'All values > Root',
    steps: [
      { stepNumber: 1, text: 'Start at the node.' },
      { stepNumber: 2, text: 'Move to its right child.' },
      { stepNumber: 3, text: 'Include all descendants connected underneath.' },
      { stepNumber: 4, text: 'Verify all values are larger than the node.' },
    ],
  },

  // Topic 12: BST Search
  12: {
    topicNumber: 12,
    title: 'BST SEARCH',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Compare the target value with the current node.' },
      { stepNumber: 3, text: 'Move left if the target is smaller.' },
      { stepNumber: 4, text: 'Move right if the target is larger.' },
      { stepNumber: 5, text: 'Repeat until the value is found or the position is empty.' },
    ],
  },

  // Topic 13: BST Insertion
  13: {
    topicNumber: 13,
    title: 'BST INSERTION',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Compare the new value with the current node.' },
      { stepNumber: 3, text: 'Move left if the value is smaller.' },
      { stepNumber: 4, text: 'Move right if the value is larger.' },
      { stepNumber: 5, text: 'Repeat until an empty position is found.' },
      { stepNumber: 6, text: 'Place the new node there.' },
    ],
  },

  // Topic 14: Deletion Overview
  14: {
    topicNumber: 14,
    title: 'DELETION OVERVIEW',
    steps: [
      { stepNumber: 1, text: 'Identify the node to delete.' },
      { stepNumber: 2, text: 'Count how many children it has (0, 1, or 2).' },
      { stepNumber: 3, text: 'If 0 children, delete directly as a leaf node.' },
      { stepNumber: 4, text: 'If 1 child, promote the child to replace the node.' },
      { stepNumber: 5, text: 'If 2 children, replace with the in-order successor.' },
    ],
  },

  // Topic 15: Delete a Leaf Node
  15: {
    topicNumber: 15,
    title: 'DELETE A LEAF NODE',
    steps: [
      { stepNumber: 1, text: 'Identify the node to delete.' },
      { stepNumber: 2, text: 'Check its children.' },
      { stepNumber: 3, text: 'It has no children.' },
      { stepNumber: 4, text: 'Remove the node.' },
      { stepNumber: 5, text: "Update the parent's connection." },
    ],
  },

  // Topic 16: Delete a Node with One Child
  16: {
    topicNumber: 16,
    title: 'DELETE A NODE WITH ONE CHILD',
    steps: [
      { stepNumber: 1, text: 'Identify the node.' },
      { stepNumber: 2, text: 'Check its children.' },
      { stepNumber: 3, text: 'It has one child.' },
      { stepNumber: 4, text: 'Find its parent.' },
      { stepNumber: 5, text: 'Connect the parent directly to the child.' },
      { stepNumber: 6, text: 'Delete the original node.' },
      { stepNumber: 7, text: 'The child takes its position.' },
    ],
  },

  // Topic 17: Delete a Node with Two Children
  17: {
    topicNumber: 17,
    title: 'DELETE A NODE WITH TWO CHILDREN',
    steps: [
      { stepNumber: 1, text: 'Identify the node.' },
      { stepNumber: 2, text: 'Check its children.' },
      { stepNumber: 3, text: 'It has two children.' },
      { stepNumber: 4, text: 'Go to the right subtree.' },
      { stepNumber: 5, text: 'Find the smallest node there.' },
      { stepNumber: 6, text: 'Use that node as the replacement.' },
      { stepNumber: 7, text: 'Delete the original successor node.' },
      { stepNumber: 8, text: 'Update the tree.' },
    ],
  },

  // Topic 18: In-Order Successor
  18: {
    topicNumber: 18,
    title: 'IN-ORDER SUCCESSOR',
    steps: [
      { stepNumber: 1, text: 'Select the node.' },
      { stepNumber: 2, text: 'Move to its right subtree.' },
      { stepNumber: 3, text: 'Move left as far as possible.' },
      { stepNumber: 4, text: 'Stop at the smallest node.' },
      { stepNumber: 5, text: 'That node is the in-order successor.' },
    ],
  },

  // Topic 19: In-Order Predecessor
  19: {
    topicNumber: 19,
    title: 'IN-ORDER PREDECESSOR',
    steps: [
      { stepNumber: 1, text: 'Select the node.' },
      { stepNumber: 2, text: 'Move to its left subtree.' },
      { stepNumber: 3, text: 'Move right as far as possible.' },
      { stepNumber: 4, text: 'Stop at the largest node.' },
      { stepNumber: 5, text: 'That node is the in-order predecessor.' },
    ],
  },

  // Topic 20: In-Order Traversal
  20: {
    topicNumber: 20,
    title: 'IN-ORDER TRAVERSAL',
    rule: 'LEFT → ROOT → RIGHT',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Visit the left subtree.' },
      { stepNumber: 3, text: 'Visit the current node.' },
      { stepNumber: 4, text: 'Visit the right subtree.' },
      { stepNumber: 5, text: 'Repeat for every subtree.' },
    ],
  },

  // Topic 21: Pre-Order Traversal
  21: {
    topicNumber: 21,
    title: 'PRE-ORDER TRAVERSAL',
    rule: 'ROOT → LEFT → RIGHT',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Visit the current node.' },
      { stepNumber: 3, text: 'Visit the left subtree.' },
      { stepNumber: 4, text: 'Visit the right subtree.' },
      { stepNumber: 5, text: 'Repeat for every subtree.' },
    ],
  },

  // Topic 22: Post-Order Traversal
  22: {
    topicNumber: 22,
    title: 'POST-ORDER TRAVERSAL',
    rule: 'LEFT → RIGHT → ROOT',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Visit the left subtree.' },
      { stepNumber: 3, text: 'Visit the right subtree.' },
      { stepNumber: 4, text: 'Visit the current node.' },
      { stepNumber: 5, text: 'Repeat for every subtree.' },
    ],
  },

  // Topic 23: Tree Height
  23: {
    topicNumber: 23,
    title: 'FIND HEIGHT OF A BST',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Find the deepest leaf.' },
      { stepNumber: 3, text: 'Follow the longest path to that leaf.' },
      { stepNumber: 4, text: 'Count the edges on the path.' },
      { stepNumber: 5, text: 'That count is the height.' },
    ],
  },

  // Topic 24: Node Depth
  24: {
    topicNumber: 24,
    title: 'FIND DEPTH OF A NODE',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Move toward the selected node.' },
      { stepNumber: 3, text: 'Count the edges you travel.' },
      { stepNumber: 4, text: "That count is the node's depth." },
    ],
  },

  // Topic 25: Balanced vs Unbalanced
  25: {
    topicNumber: 25,
    title: 'CHECK BALANCED TREE',
    rule: '|Height(Left) - Height(Right)| <= 1',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Measure the height of the left subtree.' },
      { stepNumber: 3, text: 'Measure the height of the right subtree.' },
      { stepNumber: 4, text: 'If height difference is at most 1, it is balanced.' },
    ],
  },

  // Topic 26: Time Complexity
  26: {
    topicNumber: 26,
    title: 'BST TIME COMPLEXITY',
    rule: 'O(log n) balanced vs O(n) skewed',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Compare target with current node.' },
      { stepNumber: 3, text: 'Discard half the remaining tree at each step.' },
      { stepNumber: 4, text: 'Balanced tree completes in O(log n) steps.' },
    ],
  },

  // Topic 101: Minimum Value
  101: {
    topicNumber: 101,
    title: 'FIND MINIMUM VALUE',
    rule: 'Move LEFT repeatedly',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Move to the left child.' },
      { stepNumber: 3, text: 'Keep moving left.' },
      { stepNumber: 4, text: 'Stop when there is no left child — minimum found!' },
    ],
  },

  // Topic 102: Maximum Value
  102: {
    topicNumber: 102,
    title: 'FIND MAXIMUM VALUE',
    rule: 'Move RIGHT repeatedly',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Move to the right child.' },
      { stepNumber: 3, text: 'Keep moving right.' },
      { stepNumber: 4, text: 'Stop when there is no right child — maximum found!' },
    ],
  },
};

// Additional named algorithms for Min/Max, Games, etc.
export const EXTRA_SIMPLE_ALGORITHMS = {
  findMin: {
    title: 'FIND MINIMUM VALUE',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Move to the left child.' },
      { stepNumber: 3, text: 'Keep moving left.' },
      { stepNumber: 4, text: 'Stop when there is no left child.' },
      { stepNumber: 5, text: 'That node is the minimum value.' },
    ],
  },
  findMax: {
    title: 'FIND MAXIMUM VALUE',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Move to the right child.' },
      { stepNumber: 3, text: 'Keep moving right.' },
      { stepNumber: 4, text: 'Stop when there is no right child.' },
      { stepNumber: 5, text: 'That node is the maximum value.' },
    ],
  },
  gameBuildTree: {
    title: 'GAME — BUILD THE TREE',
    steps: [
      { stepNumber: 1, text: 'Pick a number from the list.' },
      { stepNumber: 2, text: 'Start at the root.' },
      { stepNumber: 3, text: 'Compare the number with the current node.' },
      { stepNumber: 4, text: 'Choose left or right.' },
      { stepNumber: 5, text: 'Drag the number to the correct position.' },
      { stepNumber: 6, text: 'Repeat until all numbers are placed.' },
      { stepNumber: 7, text: 'Submit the completed tree.' },
      { stepNumber: 8, text: 'Check the result.' },
    ],
  },
  gameDeleteNode: {
    title: 'GAME — DELETE A NODE',
    steps: [
      { stepNumber: 1, text: 'Select the node.' },
      { stepNumber: 2, text: 'Check its children.' },
      { stepNumber: 3, text: 'Identify the deletion case.' },
      { stepNumber: 4, text: 'Apply the correct deletion rule.' },
      { stepNumber: 5, text: 'Update the tree.' },
      { stepNumber: 6, text: 'Submit the answer.' },
    ],
  },
};

export function getSimpleAlgorithmForTopic(topicNumber: number): SimpleAlgorithmData {
  if (TOPIC_SIMPLE_ALGORITHMS[topicNumber]) {
    return TOPIC_SIMPLE_ALGORITHMS[topicNumber];
  }
  return {
    topicNumber,
    title: 'SIMPLE ALGORITHM',
    steps: [
      { stepNumber: 1, text: 'Start at the root.' },
      { stepNumber: 2, text: 'Inspect the node value and children.' },
      { stepNumber: 3, text: 'Follow the BST rules to perform the operation.' },
      { stepNumber: 4, text: 'Verify the BST properties remain valid.' },
    ],
  };
}
