import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BSTNode, DropSlot } from '../../types';
import { layoutTree, flattenTree } from '../../utils/bst';
import { useTheme } from '../../context/ThemeContext';

interface TreeCanvasProps {
  root: BSTNode | null;
  onNodeClick?: (node: BSTNode) => void;
  onSlotClick?: (slot: DropSlot) => void;
  onSlotDrop?: (slot: DropSlot, value: number, dropCoordinates?: { x: number; y: number }) => void;
  onNodeDragStart?: (node: BSTNode) => void;
  onNodePointerDown?: (e: React.PointerEvent, node: BSTNode) => void;
  dropSlots?: DropSlot[];
  slots?: DropSlot[];
  activeNodeId?: string | null;
  comparingNodeId?: string | null;
  selectedNodeId?: string | null;
  targetValue?: number | null;
  highlightedNodeIds?: string[];
  highlightedValues?: number[];
  invalidNodeIds?: string[];
  correctNodeIds?: string[];
  visitedNodeIds?: string[];
  nodeLabels?: Record<string, string>;
  comparisonBanner?: {
    text: string;
    subtext?: string;
    direction?: string;
  };
  showSubtreeTags?: boolean;
  className?: string;
  width?: number;
  height?: number;
  emptyMessage?: string;
  selectedDragValue?: number | null;
  invalidSlotId?: string | null;
  guidedCorrectSlotId?: string | null;
  justAddedNodeId?: string | null;
  activeHoveredSlotId?: string | null;
  emptySlot?: {
    id: string;
    label?: string;
    parentId?: string | null;
    direction?: 'root' | 'left' | 'right';
    leftId?: string | null;
    rightId?: string | null;
    x?: number;
    y?: number;
  } | null;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  root,
  onNodeClick,
  onSlotClick,
  onSlotDrop,
  onNodeDragStart,
  onNodePointerDown,
  dropSlots = [],
  slots,
  activeNodeId,
  comparingNodeId,
  selectedNodeId,
  targetValue,
  highlightedNodeIds = [],
  highlightedValues = [],
  invalidNodeIds = [],
  correctNodeIds = [],
  visitedNodeIds = [],
  nodeLabels = {},
  comparisonBanner,
  showSubtreeTags = false,
  className = '',
  width = 680,
  emptyMessage = 'Tree is empty. Drag a number into the root position!',
  selectedDragValue,
  invalidSlotId,
  guidedCorrectSlotId,
  justAddedNodeId,
  activeHoveredSlotId,
  emptySlot,
}) => {
  const { isDark } = useTheme();
  const [hoveredEmptySlotId, setHoveredEmptySlotId] = React.useState<string | null>(null);
  const [internalHoveredSlotId, setInternalHoveredSlotId] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const effectiveHoveredSlotId = activeHoveredSlotId || internalHoveredSlotId;

  // If tree is completely empty and no drop slots provided, calculate root slot
  const actualSlots = [...(slots !== undefined ? slots : dropSlots)];
  if (!root && actualSlots.length === 0) {
    actualSlots.push({
      id: 'slot-root',
      parentId: null,
      direction: 'root',
      x: width / 2,
      y: 55,
    });
  }

  const { root: laidOutRoot, totalWidth, totalHeight } = layoutTree(root, width, 55, 68);
  const { nodes, edges } = flattenTree(laidOutRoot);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropOnSlot = (e: React.DragEvent, slot: DropSlot) => {
    e.preventDefault();
    e.stopPropagation();
    setInternalHoveredSlotId(null);
    const dataStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/node-value');
    const val = parseInt(dataStr, 10);
    if (!isNaN(val) && onSlotDrop) {
      onSlotDrop(slot, val, { x: e.clientX, y: e.clientY });
    }
  };

  const handleSvgDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInternalHoveredSlotId(null);

    let val: number | null = null;
    const textData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/node-value');
    if (textData && !isNaN(parseInt(textData, 10))) {
      val = parseInt(textData, 10);
    }
    if (val === null && onNodeDragStart) {
      try {
        const jsonStr = e.dataTransfer.getData('application/node-json') || e.dataTransfer.getData('application/json');
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed && typeof parsed.value === 'number') {
            val = parsed.value;
          }
        }
      } catch {}
    }
    if (val === null) return;

    // Convert drop coordinates to SVG coordinates
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgPt = pt.matrixTransform(ctm.inverse());

    // Check empty slot (Level 4)
    const emptySlotNode = nodes.find((n) => n.isEmptySlot);
    if (emptySlotNode) {
      const dist = Math.hypot(svgPt.x - emptySlotNode.x, svgPt.y - emptySlotNode.y);
      if (dist <= 50 && onSlotDrop) {
        onSlotDrop(
          {
            id: emptySlotNode.id,
            parentId: null,
            direction: 'root',
            x: emptySlotNode.x,
            y: emptySlotNode.y,
          },
          val
        );
        return;
      }
    }

    // Check candidate drop slots
    let closestSlot: DropSlot | null = null;
    let minDist = 50; // 50 SVG units radius
    for (const slot of actualSlots) {
      const dist = Math.hypot(svgPt.x - slot.x, svgPt.y - slot.y);
      if (dist < minDist) {
        minDist = dist;
        closestSlot = slot;
      }
    }

    if (closestSlot && onSlotDrop) {
      onSlotDrop(closestSlot, val);
    }
  };

  return (
    <div
      id="bst-tree-canvas-container"
      className={`relative w-full overflow-x-auto overflow-y-hidden select-none flex justify-center items-center py-2 ${className}`}
    >
      <svg
        ref={svgRef}
        id="bst-svg-canvas"
        viewBox={`0 0 ${totalWidth} ${Math.max(totalHeight, actualSlots.length > 0 ? 220 : 180)}`}
        className="w-full max-w-[760px] h-auto transition-all duration-300"
        style={{ minHeight: `${Math.min(Math.max(totalHeight, 220), 380)}px` }}
        onDragOver={handleDragOver}
        onDrop={handleSvgDrop}
      >
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#2E2860' : '#c7d2fe'} stopOpacity="0.9" />
            <stop offset="100%" stopColor={isDark ? '#1C1B3A' : '#e0e7ff'} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="activeEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#9D6FFF' : '#4f46e5'} />
            <stop offset="100%" stopColor={isDark ? '#6D3CFF' : '#6366f1'} />
          </linearGradient>
          <linearGradient id="slotEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#161D38' : '#e0e7ff'} />
            <stop offset="100%" stopColor={isDark ? '#2A2258' : '#c7d2fe'} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Existing Edges / Branches */}
        <g id="tree-edges-group">
          {edges.map((edge) => {
            const isLeft = edge.direction === 'left';
            const isEdgeActive =
              activeNodeId === edge.to.id ||
              comparingNodeId === edge.to.id ||
              (highlightedNodeIds.includes(edge.from.id) && highlightedNodeIds.includes(edge.to.id));

            return (
              <g key={`edge-${edge.from.id}-${edge.to.id}`}>
                <line
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={isEdgeActive ? (isDark ? '#7C3CFF' : '#4f46e5') : 'url(#edgeGradient)'}
                  strokeWidth={isEdgeActive ? 3.5 : 2}
                  className="transition-all duration-300"
                />
                {showSubtreeTags && (
                  <text
                    x={(edge.from.x + edge.to.x) / 2 + (isLeft ? -12 : 12)}
                    y={(edge.from.y + edge.to.y) / 2 - 2}
                    fill={isDark ? '#9D6FFF' : '#4f46e5'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none pointer-events-none opacity-90"
                  >
                    {isLeft ? '<' : '>'}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Candidate Drop Slots (Neutral circular drop targets) */}
        <g id="tree-drop-slots-group">
          {actualSlots.map((slot) => {
            const parentNode = nodes.find((n) => n.id === slot.parentId);
            const isSlotHovered = effectiveHoveredSlotId === slot.id;
            const isSlotInvalid = invalidSlotId === slot.id;
            const isSlotGuidedCorrect = guidedCorrectSlotId === slot.id;

            // Compute stroke, fill, text for the slot states
            let lineStroke = isDark ? '#383068' : '#c7d2fe';
            let outerFill = isDark ? '#140E38' : '#f8fafc';
            let outerStroke = isDark ? '#7C3CFF' : '#818cf8';
            let outerStrokeWidth = '1.5';
            let outerDash = '3 3';
            let innerFill = isDark ? '#0D1428' : '#ffffff';
            let innerStroke = isDark ? '#4338ca' : '#a5b4fc';
            let textFill = isDark ? '#9D6FFF' : '#4f46e5';
            let labelText = '';
            let labelFontSize = '16';

            if (isSlotInvalid) {
              // Wrong drop: Turn bright RED
              lineStroke = '#ef4444';
              outerFill = isDark ? '#450a0a' : '#fee2e2';
              outerStroke = '#ef4444';
              outerStrokeWidth = '3';
              outerDash = 'none';
              innerFill = isDark ? '#7f1d1d' : '#fecaca';
              innerStroke = '#dc2626';
              textFill = '#dc2626';
              labelText = '✕';
              labelFontSize = '16';
            } else if (isSlotGuidedCorrect) {
              // Guided Solve mode ONLY: Show green correct position
              lineStroke = '#10b981';
              outerFill = isDark ? '#064e3b' : '#d1fae5';
              outerStroke = '#10b981';
              outerStrokeWidth = '3';
              outerDash = 'none';
              innerFill = isDark ? '#047857' : '#a7f3d0';
              innerStroke = '#059669';
              textFill = '#059669';
              labelText = '✓';
              labelFontSize = '16';
            } else if (isSlotHovered) {
              // Neutral hovered drop target (No + symbol)
              lineStroke = isDark ? '#818cf8' : '#6366f1';
              outerFill = isDark ? '#241359' : '#e0e7ff';
              outerStroke = isDark ? '#a5b4fc' : '#4f46e5';
              outerStrokeWidth = '2.5';
              outerDash = 'none';
              innerFill = isDark ? '#1e1b4b' : '#c7d2fe';
              innerStroke = isDark ? '#818cf8' : '#4f46e5';
              textFill = isDark ? '#ffffff' : '#312e81';
              labelText = '';
              labelFontSize = '14';
            } else if (selectedDragValue !== null && selectedDragValue !== undefined) {
              // When dragging an element, all available empty positions look equivalent (No + symbol)
              outerFill = isDark ? '#1e1b4b' : '#eef2ff';
              outerStroke = isDark ? '#7C3CFF' : '#6366f1';
              outerStrokeWidth = '1.8';
              innerFill = isDark ? '#0f172a' : '#ffffff';
              innerStroke = isDark ? '#6366f1' : '#818cf8';
              textFill = isDark ? '#c7d2fe' : '#4f46e5';
              labelText = '';
              labelFontSize = '14';
            }

            return (
              <g
                key={slot.id}
                id={`drop-slot-${slot.id}`}
                data-drop-slot="true"
                data-slot-id={slot.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSlotClick) {
                    onSlotClick(slot);
                  }
                }}
                onDragOver={(e) => {
                  handleDragOver(e);
                  if (internalHoveredSlotId !== slot.id) {
                    setInternalHoveredSlotId(slot.id);
                  }
                }}
                onDragLeave={() => {
                  if (internalHoveredSlotId === slot.id) {
                    setInternalHoveredSlotId(null);
                  }
                }}
                onDrop={(e) => handleDropOnSlot(e, slot)}
              >
                {/* Connecting dashed line */}
                {parentNode && (
                  <line
                    x1={parentNode.x}
                    y1={parentNode.y}
                    x2={slot.x}
                    y2={slot.y}
                    stroke={lineStroke}
                    strokeWidth={isSlotInvalid || isSlotGuidedCorrect ? 2.5 : isSlotHovered ? 2.5 : 2}
                    strokeDasharray={isSlotInvalid || isSlotGuidedCorrect ? 'none' : '4 4'}
                    className="opacity-80 transition-colors"
                  />
                )}

                {/* Single target slot circle (radius 20 matching tree nodes, static with no movement) */}
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="20"
                  fill={innerFill}
                  stroke={outerStroke}
                  strokeWidth={isSlotInvalid || isSlotGuidedCorrect ? '2.5' : isSlotHovered ? '2.5' : '2'}
                  strokeDasharray={isSlotInvalid || isSlotGuidedCorrect ? 'none' : '4 3'}
                  className={`transition-colors duration-200 ${
                    isSlotInvalid || isSlotGuidedCorrect || isSlotHovered
                      ? 'opacity-100'
                      : 'opacity-85 group-hover:opacity-100'
                  }`}
                />

                {/* ✕ for invalid, ✓ for guided, or DROP label inside slot (No + symbol) */}
                {labelText ? (
                  <text
                    x={slot.x}
                    y={slot.y + (labelText === 'DROP' ? 4 : 5)}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize={labelFontSize}
                    fontWeight="bold"
                    className="select-none pointer-events-none transition-transform"
                  >
                    {labelText}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g id="tree-nodes-group">
          <AnimatePresence>
            {nodes.map((node) => {
              const isComparing = node.id === comparingNodeId;
              const isActive = node.id === activeNodeId;
              const isSelected = node.id === selectedNodeId;
              const isTarget = targetValue !== undefined && targetValue !== null && node.value === targetValue;
              const isHighlighted = highlightedNodeIds.includes(node.id) || highlightedValues.includes(node.value);
              const isInvalid = invalidNodeIds.includes(node.id);
              const isCorrect = correctNodeIds.includes(node.id);
              const isVisited = visitedNodeIds.includes(node.id);
              const isJustAdded = node.id === justAddedNodeId;

              let fillColor = isDark ? '#0D1428' : '#ffffff';
              let strokeColor = isDark ? '#2E2860' : '#6366f1';
              let textColor = isDark ? '#F8FAFC' : '#0f172a';
              let scale = 1;
              let isSpecialGlow = false;

              if (isJustAdded) {
                fillColor = isDark ? '#241359' : '#e0e7ff';
                strokeColor = isDark ? '#7C3CFF' : '#4f46e5';
                textColor = isDark ? '#DEC7FF' : '#3730a3';
                isSpecialGlow = true;
                scale = 1.15;
              } else if (isInvalid) {
                fillColor = isDark ? '#4c0519' : '#fef2f2';
                strokeColor = isDark ? '#fb7185' : '#ef4444';
                textColor = isDark ? '#fecdd3' : '#991b1b';
                isSpecialGlow = true;
              } else if (isCorrect) {
                fillColor = isDark ? '#064e3b' : '#ecfdf5';
                strokeColor = isDark ? '#34d399' : '#10b981';
                textColor = isDark ? '#a7f3d0' : '#065f46';
                isSpecialGlow = true;
                scale = 1.05;
              } else if (isSelected) {
                fillColor = isDark ? '#241359' : '#e0e7ff';
                strokeColor = isDark ? '#7C3CFF' : '#4338ca';
                textColor = isDark ? '#F8FAFC' : '#312e81';
                scale = 1.14;
                isSpecialGlow = true;
              } else if (isComparing) {
                fillColor = isDark ? '#111A31' : '#f5f3ff';
                strokeColor = isDark ? '#7C3CFF' : '#4f46e5';
                textColor = isDark ? '#C2A3FF' : '#3730a3';
                scale = 1.12;
                isSpecialGlow = true;
              } else if (isActive || isTarget) {
                fillColor = isDark ? '#241359' : '#e0e7ff';
                strokeColor = isDark ? '#7C3CFF' : '#4f46e5';
                textColor = isDark ? '#F8FAFC' : '#3730a3';
                scale = 1.15;
                isSpecialGlow = true;
              } else if (isHighlighted) {
                fillColor = isDark ? '#241359' : '#e0e7ff';
                strokeColor = isDark ? '#7C3CFF' : '#4338ca';
                textColor = isDark ? '#F8FAFC' : '#312e81';
                scale = 1.12;
                isSpecialGlow = true;
              } else if (isVisited) {
                fillColor = isDark ? '#060A18' : '#f8fafc';
                strokeColor = isDark ? '#1E2640' : '#94a3b8';
                textColor = isDark ? '#64748B' : '#475569';
              }

              if (node.isEmptySlot) {
                const isHovered = effectiveHoveredSlotId === node.id || hoveredEmptySlotId === node.id;
                return (
                  <g
                    key={node.id}
                    id={`canvas-empty-slot-${node.id}`}
                    data-drop-slot="true"
                    data-slot-id={node.id}
                    data-slot-type="empty-slot"
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group select-none"
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSlotClick) {
                        onSlotClick({
                          id: node.id,
                          parentId: null,
                          direction: 'root',
                          x: node.x,
                          y: node.y,
                        });
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHoveredEmptySlotId(node.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'move';
                      if (hoveredEmptySlotId !== node.id) {
                        setHoveredEmptySlotId(node.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHoveredEmptySlotId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHoveredEmptySlotId(null);

                      let val: number | null = null;
                      const textData = e.dataTransfer.getData('text/plain');
                      if (textData && !isNaN(parseInt(textData, 10))) {
                        val = parseInt(textData, 10);
                      }
                      if (val === null) {
                        const valData = e.dataTransfer.getData('application/node-value');
                        if (valData && !isNaN(parseInt(valData, 10))) {
                          val = parseInt(valData, 10);
                        }
                      }
                      if (val === null) {
                        try {
                          const jsonStr = e.dataTransfer.getData('application/node-json') || e.dataTransfer.getData('application/json');
                          if (jsonStr) {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed && typeof parsed.value === 'number') {
                              val = parsed.value;
                            }
                          }
                        } catch {}
                      }

                      if (val !== null && onSlotDrop) {
                        onSlotDrop(
                          {
                            id: node.id,
                            parentId: null,
                            direction: 'root',
                            x: node.x,
                            y: node.y,
                          },
                          val
                        );
                      }
                    }}
                  >
                    {/* Single vacancy slot circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r="20"
                      fill={isDark ? '#1e1b4b' : '#ffffff'}
                      stroke={isHovered ? '#d97706' : (isDark ? '#fbbf24' : '#b45309')}
                      strokeWidth={isHovered ? 2.5 : 2}
                      strokeDasharray="4 2"
                      style={{ pointerEvents: 'all' }}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isDark ? '#fbbf24' : '#b45309'}
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="monospace"
                      className="select-none pointer-events-none tracking-wider"
                    >
                      {node.label || 'EMPTY'}
                    </text>
                    <text
                      x="0"
                      y="34"
                      textAnchor="middle"
                      fill={isDark ? '#fbbf24' : '#d97706'}
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none pointer-events-none uppercase tracking-wider"
                    >
                      Drop Replacement
                    </text>
                  </g>
                );
              }

              const customLabel = nodeLabels[node.id];

              return (
                <g
                  key={node.id}
                  id={`canvas-node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
                  className="cursor-pointer group transition-transform duration-200 select-none"
                  style={{ cursor: 'grab', pointerEvents: 'all' }}
                  {...({ draggable: true } as any)}
                  onDragStart={(e: any) => {
                    e.stopPropagation();
                    if (e.dataTransfer) {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(node.value));
                      e.dataTransfer.setData('application/node-id', node.id);
                      e.dataTransfer.setData('application/node-value', String(node.value));
                      e.dataTransfer.setData('application/node-json', JSON.stringify({ id: node.id, value: node.value }));
                      e.dataTransfer.setData('application/json', JSON.stringify({ id: node.id, value: node.value }));
                    }
                    if (onNodeDragStart) {
                      onNodeDragStart(node);
                    }
                  }}
                  onPointerDown={(e) => {
                    if (onNodePointerDown) {
                      onNodePointerDown(e, node);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNodeClick) onNodeClick(node);
                  }}
                >
                  {/* Single Main Node Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isActive || isComparing || isSelected ? 3 : 2}
                    className="transition-all duration-300 shadow-sm"
                    style={{ pointerEvents: 'all', cursor: 'grab' }}
                    {...({ draggable: true } as any)}
                    onDragStart={(e: any) => {
                      e.stopPropagation();
                      if (e.dataTransfer) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(node.value));
                        e.dataTransfer.setData('application/node-id', node.id);
                        e.dataTransfer.setData('application/node-value', String(node.value));
                        e.dataTransfer.setData('application/node-json', JSON.stringify({ id: node.id, value: node.value }));
                        e.dataTransfer.setData('application/json', JSON.stringify({ id: node.id, value: node.value }));
                      }
                      if (onNodeDragStart) {
                        onNodeDragStart(node);
                      }
                    }}
                  />

                  {/* Value Text */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    {node.value}
                  </text>

                  {/* Node Label underneath if provided */}
                  {customLabel && (
                    <text
                      x="0"
                      y="32"
                      textAnchor="middle"
                      fill={isDark ? '#818cf8' : '#4f46e5'}
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none pointer-events-none uppercase tracking-wider"
                    >
                      {customLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </AnimatePresence>
        </g>
      </svg>

      {/* Comparison Rule Banner for Guided Solve */}
      {comparisonBanner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg text-xs font-mono font-bold flex items-center gap-2 z-20 pointer-events-none"
        >
          <span>{comparisonBanner.text}</span>
          {comparisonBanner.subtext && (
            <span className="text-[11px] font-sans font-normal opacity-90 text-indigo-100">
              • {comparisonBanner.subtext}
            </span>
          )}
        </motion.div>
      )}

      {/* Empty State Banner */}
      {!root && actualSlots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 border border-indigo-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 rounded-xl px-4 py-3 text-xs font-semibold shadow-sm text-center">
            {emptyMessage}
          </div>
        </div>
      )}
    </div>
  );
};

