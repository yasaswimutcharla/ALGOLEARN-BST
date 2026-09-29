export const TOPIC_KEY_RULES: Record<string, string[]> = {
  'lesson-1': [
    'A tree has exactly one root node with no incoming edges (in-degree = 0).',
    'Every node except the root has exactly one incoming edge from its unique parent.',
    'A tree with N nodes always contains exactly N - 1 directed edges.',
    'Trees are strictly acyclic: there is exactly one unique path between the root and any node.',
  ],
  'lesson-2': [
    'Every node in a binary tree can have at most two children (degree ≤ 2).',
    'Each child is strictly distinguished as either a left child or a right child.',
    'At depth d, the maximum possible number of nodes is 2^d (with root at depth 0).',
    'A binary tree of height h has at most 2^(h+1) - 1 total nodes.',
  ],
  'lesson-3': [
    'Every node X satisfies: all values in LeftSubtree(X) < X.val < all values in RightSubtree(X).',
    'Duplicate values are generally prohibited or stored using dedicated frequency counters.',
    'The BST invariant applies recursively to all subtrees, not just direct children.',
    'Searching, inserting, and deleting run in O(h) time, bounded by the tree height.',
  ],
  'lesson-4': [
    'The global BST ordering invariant must hold for all ancestors and descendants across the entire tree.',
    'A node is never evaluated only against its immediate parent; all ancestor bounds apply.',
    'An Inorder traversal of any valid BST always yields strictly increasing, sorted order.',
    'Violating the property at even a single node invalidates the tree as a Binary Search Tree.',
  ],
  'lesson-5': [
    'The root is the topmost origin of the tree and has no parent (in-degree is 0).',
    'Every search, insertion, and traversal operation begins by referencing the root pointer.',
    'If the root pointer is null (root == null), the tree is completely empty.',
    'When the root is deleted, an inorder successor or predecessor must be promoted to maintain BST balance.',
  ],
  'lesson-6': [
    'A parent node directly precedes one or two child nodes in the hierarchy.',
    'In a binary tree, a parent can have at most 2 children: one left and one right.',
    'If parent.left exists, parent.left.val < parent.val; if parent.right exists, parent.right.val > parent.val.',
    'Removing a parent requires cleanly updating its own parent pointer to its replacement child.',
  ],
  'lesson-7': [
    'A child node has exactly one parent node directly above it.',
    'A left child always holds a key strictly less than its parent key.',
    'A right child always holds a key strictly greater than its parent key.',
    'A child can be a leaf node (0 children) or an internal node having children of its own.',
  ],
  'lesson-8': [
    'A leaf node (external node) has degree 0 (both left == null and right == null).',
    'In a non-empty full binary tree, Number of Leaves = Number of Internal Nodes + 1.',
    'Deleting a leaf node requires no subtree re-linking—simply nullify the parent reference.',
    'Leaf nodes are always at the bottom-most ends of traversal branches.',
  ],
  'lesson-9': [
    'An internal node has at least one non-null child (degree ≥ 1) and is not a leaf.',
    'An internal node serves as an intermediate routing decision point during BST lookups.',
    'Deletion of an internal node requires pointer re-assignment to preserve descendant links.',
    'If an internal node has two children, its removal requires finding its inorder successor or predecessor.',
  ],
  'lesson-10': [
    'Every node in the left subtree of node X must have a value strictly less than X.val.',
    'The maximum value in the left subtree is the immediate Inorder Predecessor of node X.',
    'If search target < current.val, execution branches exclusively into the left subtree.',
    'The left subtree must itself be a fully valid, self-contained Binary Search Tree.',
  ],
  'lesson-11': [
    'Every node in the right subtree of node X must have a value strictly greater than X.val.',
    'The minimum value in the right subtree is the immediate Inorder Successor of node X.',
    'If search target > current.val, execution branches exclusively into the right subtree.',
    'The right subtree must itself be a fully valid, self-contained Binary Search Tree.',
  ],
  'lesson-12': [
    'Compare target key with current node: if target == key, return match immediately.',
    'If target < current.val, branch exclusively left: search(node.left, target).',
    'If target > current.val, branch exclusively right: search(node.right, target).',
    'If current == null is reached without a match, the key does not exist in the BST.',
  ],
  'lesson-13': [
    'New nodes are always inserted as fresh leaf nodes at an empty null slot.',
    'Traverse down from root using BST search rules until encountering a null link.',
    'Attach the new node as the left or right child of the last visited parent node.',
    'Insertion never shifts or reorders existing nodes; tree shape depends on insertion order.',
  ],
  'lesson-14': [
    'Case 1 (Leaf Node): Nullify parent reference directly (0 children to manage).',
    'Case 2 (One Child): Bypass the node by pointing parent directly to the single child.',
    'Case 3 (Two Children): Replace node value with its Inorder Successor, then delete the successor.',
    'All three deletion cases preserve the BST invariant across the entire tree.',
  ],
  'lesson-15': [
    'Identify that node.left == null AND node.right == null.',
    'Determine whether the target is the left or right child of its parent.',
    'Set parent.left = null or parent.right = null (or root = null if only one node existed).',
    'Time complexity is O(h) to locate the leaf and O(1) to disconnect the reference.',
  ],
  'lesson-16': [
    'Identify that exactly one child exists (either left != null OR right != null).',
    'Link the parent of the deleted node directly to the single existing child.',
    'If the deleted node is the root, promote the single child as the new root of the tree.',
    'The BST invariant is automatically preserved because all descendants in that branch maintain order.',
  ],
  'lesson-17': [
    'Identify that both node.left != null and node.right != null.',
    'Find the Inorder Successor (minimum node in the right subtree) or Inorder Predecessor.',
    'Copy the successor value into the target node being deleted.',
    'Recursively delete the successor node from the right subtree (which has at most one child).',
  ],
  'lesson-18': [
    'The Inorder Successor of node X is the node with the smallest key strictly greater than X.val.',
    'If X has a right subtree, the successor is the leftmost node in X.right.',
    'If X has no right subtree, the successor is the lowest ancestor whose left child is also an ancestor of X.',
    'The successor in a right subtree is guaranteed to have at most one child (no left child).',
  ],
  'lesson-19': [
    'The Inorder Predecessor of node X is the node with the largest key strictly less than X.val.',
    'If X has a left subtree, the predecessor is the rightmost node in X.left.',
    'If X has no left subtree, the predecessor is the lowest ancestor whose right child is also an ancestor of X.',
    'The predecessor in a left subtree is guaranteed to have at most one child (no right child).',
  ],
  'lesson-20': [
    'Traversal order is strictly: Left Subtree → Current Node → Right Subtree (LNR).',
    'For any valid BST, an inorder traversal always produces keys in non-decreasing sorted order.',
    'Inorder traversal on a BST of N nodes visits each node exactly once in O(N) time.',
    'Aux space complexity is O(h) due to the call stack depth or explicit stack size.',
  ],
  'lesson-21': [
    'Traversal order is strictly: Current Node → Left Subtree → Right Subtree (NLR).',
    'The root node is always processed first, followed by root left descendants, then right descendants.',
    'Preorder sequence is used to serialize and clone a BST with identical hierarchical structure.',
    'Time complexity is O(N) visiting every node, with O(h) recursion stack space.',
  ],
  'lesson-22': [
    'Traversal order is strictly: Left Subtree → Right Subtree → Current Node (LRN).',
    'Children are always evaluated and processed before their parent node.',
    'Postorder sequence is essential for bottom-up operations like tree deletion and subtree height calculation.',
    'The root node of the tree is always the very last node processed in postorder.',
  ],
  'lesson-23': [
    'Height of a node is the number of edges on the longest downward path from that node to a leaf.',
    'Height of a leaf node is 0; height of an empty tree is conventionally -1.',
    'Height(node) = 1 + max(Height(node.left), Height(node.right)).',
    'The height of a balanced BST with N nodes is ⌊log2(N)⌋, ensuring optimal O(log N) operations.',
  ],
  'lesson-24': [
    'Depth of a node is the number of edges from the root node down to that specific node.',
    'The depth of the root node is always 0.',
    'Depth increases by exactly 1 with each downward step: Depth(child) = Depth(parent) + 1.',
    'The maximum depth among all nodes in a tree equals the overall height of the tree.',
  ],
  'lesson-25': [
    'A BST is height-balanced (AVL condition) if for every node: |Height(left) - Height(right)| ≤ 1.',
    'In a balanced BST, height is strictly O(log N), guaranteeing fast O(log N) operations.',
    'Inserting sorted or reverse-sorted keys degenerates an unbalanced BST into a linked list of height O(N).',
    'Self-balancing trees (AVL, Red-Black) perform tree rotations to restore the balance invariant.',
  ],
  'lesson-26': [
    'In a balanced BST, Search, Insert, and Delete all execute in O(log N) average/best time.',
    'In a skewed/degenerate BST, Search, Insert, and Delete degrade to O(N) worst-case time.',
    'Tree traversals (Inorder, Preorder, Postorder) always run in O(N) time as every node must be visited.',
    'Space complexity for operations is O(h), bounded by the maximum recursion call stack height.',
  ],
};

export function getKeyRulesForLesson(lessonId: string): string[] {
  return TOPIC_KEY_RULES[lessonId] || [
    'A tree has one root node and every other node has exactly one parent.',
    'Each child is connected to its parent by an edge.',
    'A leaf node has no children.',
    'Trees represent hierarchical relationships.',
  ];
}
