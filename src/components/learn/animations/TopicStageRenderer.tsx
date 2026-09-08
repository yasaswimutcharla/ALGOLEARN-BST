import React from 'react';
import { motion } from 'motion/react';
import { VisualStepData, AnimationNodeInfo, AnimationEdgeInfo } from './types';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface TopicStageRendererProps {
  stepData: VisualStepData;
  onNodeClick?: (node: AnimationNodeInfo) => void;
  selectedNodeId?: string | null;
}

export const TopicStageRenderer: React.FC<TopicStageRendererProps> = ({
  stepData,
  onNodeClick,
  selectedNodeId,
}) => {
  const { isDark } = useTheme();
  const { nodes, edges, banner, traversalOutput } = stepData;

  const nodeMap = new Map<string, AnimationNodeInfo>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const getNodeColors = (state?: AnimationNodeInfo['state']) => {
    if (isDark) {
      switch (state) {
        case 'active':
          return {
            fill: '#241359',
            stroke: '#7C3CFF',
            text: '#DEC7FF',
            glow: 'rgba(124, 60, 255, 0.5)',
          };
        case 'found':
          return {
            fill: '#064e3b',
            stroke: '#34d399',
            text: '#a7f3d0',
            glow: 'rgba(52, 211, 153, 0.5)',
          };
        case 'target':
          return {
            fill: '#4c0519',
            stroke: '#fb7185',
            text: '#fecdd3',
            glow: 'rgba(251, 113, 133, 0.5)',
          };
        case 'successor':
          return {
            fill: '#451a03',
            stroke: '#fbbf24',
            text: '#fde68a',
            glow: 'rgba(251, 191, 36, 0.5)',
          };
        case 'child-replace':
          return {
            fill: '#15203D',
            stroke: '#7C3CFF',
            text: '#C2A3FF',
            glow: 'rgba(124, 60, 255, 0.4)',
          };
        case 'inserted':
          return {
            fill: '#2B1870',
            stroke: '#9D6FFF',
            text: '#EFE4FF',
            glow: 'rgba(157, 111, 255, 0.5)',
          };
        case 'warning':
          return {
            fill: '#451a03',
            stroke: '#f59e0b',
            text: '#fef3c7',
            glow: 'rgba(245, 158, 11, 0.4)',
          };
        case 'deleted':
          return {
            fill: '#0D1428',
            stroke: '#283768',
            text: '#94A3B8',
            glow: 'none',
          };
        case 'dimmed':
          return {
            fill: '#060A18',
            stroke: '#1E2640',
            text: '#64748B',
            glow: 'none',
          };
        case 'highlight':
          return {
            fill: '#241359',
            stroke: '#9D6FFF',
            text: '#F8FAFC',
            glow: 'rgba(109, 60, 255, 0.5)',
          };
        default:
          return {
            fill: '#0D1428',
            stroke: '#2E2860',
            text: '#F8FAFC',
            glow: 'none',
          };
      }
    }

    switch (state) {
      case 'active':
        return {
          fill: '#EEF2FF',
          stroke: '#6366F1',
          text: '#312E81',
          glow: 'rgba(99, 102, 241, 0.4)',
        };
      case 'found':
        return {
          fill: '#ECFDF5',
          stroke: '#10B981',
          text: '#064E3B',
          glow: 'rgba(16, 185, 129, 0.4)',
        };
      case 'target':
        return {
          fill: '#FFF1F2',
          stroke: '#F43F5E',
          text: '#881337',
          glow: 'rgba(244, 63, 94, 0.4)',
        };
      case 'successor':
        return {
          fill: '#FEF3C7',
          stroke: '#F59E0B',
          text: '#78350F',
          glow: 'rgba(245, 158, 11, 0.5)',
        };
      case 'child-replace':
        return {
          fill: '#E0F2FE',
          stroke: '#0284C7',
          text: '#0369A1',
          glow: 'rgba(2, 132, 199, 0.4)',
        };
      case 'inserted':
        return {
          fill: '#FAF5FF',
          stroke: '#A855F7',
          text: '#581C87',
          glow: 'rgba(168, 85, 247, 0.4)',
        };
      case 'warning':
        return {
          fill: '#FFFBEB',
          stroke: '#D97706',
          text: '#92400E',
          glow: 'rgba(217, 119, 6, 0.3)',
        };
      case 'deleted':
        return {
          fill: '#F1F5F9',
          stroke: '#94A3B8',
          text: '#64748B',
          glow: 'none',
        };
      case 'dimmed':
        return {
          fill: '#F8FAFC',
          stroke: '#E2E8F0',
          text: '#94A3B8',
          glow: 'none',
        };
      case 'highlight':
        return {
          fill: '#EFF6FF',
          stroke: '#3B82F6',
          text: '#1E3A8A',
          glow: 'rgba(59, 130, 246, 0.4)',
        };
      default:
        return {
          fill: '#FFFFFF',
          stroke: '#CBD5E1',
          text: '#1E293B',
          glow: 'none',
        };
    }
  };

  const getEdgeStyle = (state?: AnimationEdgeInfo['state']) => {
    switch (state) {
      case 'active':
        return {
          stroke: isDark ? '#818cf8' : '#6366F1',
          strokeWidth: 3,
          strokeDasharray: 'none',
          opacity: 1,
        };
      case 'severed':
        return {
          stroke: '#F43F5E',
          strokeWidth: 2.5,
          strokeDasharray: '5,5',
          opacity: 0.7,
        };
      case 'rewired':
        return {
          stroke: '#10B981',
          strokeWidth: 3,
          strokeDasharray: 'none',
          opacity: 1,
        };
      case 'successor':
        return {
          stroke: '#F59E0B',
          strokeWidth: 2.5,
          strokeDasharray: '4,4',
          opacity: 1,
        };
      case 'dimmed':
        return {
          stroke: isDark ? '#334155' : '#E2E8F0',
          strokeWidth: 1.5,
          strokeDasharray: 'none',
          opacity: 0.4,
        };
      default:
        return {
          stroke: isDark ? '#475569' : '#94A3B8',
          strokeWidth: 2,
          strokeDasharray: 'none',
          opacity: 0.8,
        };
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Comparison & Operation Banner */}
      {banner && (
        <motion.div
          key={`banner-${stepData.stepIndex}-${banner.text}`}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`w-full mb-3 px-4 py-2.5 rounded-xl border flex items-center justify-between shadow-xs ${
            banner.type === 'LEFT'
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
              : banner.type === 'RIGHT'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : banner.type === 'FOUND' || banner.type === 'SUCCESS'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : banner.type === 'DELETE'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : banner.type === 'REWIRE'
              ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
              : banner.type === 'WARNING'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
              : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {banner.type === 'LEFT' && <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />}
            {banner.type === 'RIGHT' && <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />}
            {(banner.type === 'FOUND' || banner.type === 'SUCCESS') && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {banner.type === 'DELETE' && <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            {banner.type === 'REWIRE' && <Crown className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
            {banner.type === 'INFO' && <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}

            <div>
              <div className="font-bold text-sm leading-tight">{banner.text}</div>
              {banner.subtext && <div className="text-xs opacity-80 leading-tight mt-0.5">{banner.subtext}</div>}
            </div>
          </div>

          <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/80 border border-current/20">
            {banner.type}
          </span>
        </motion.div>
      )}

      {/* Traversal Output Sequence Ribbon */}
      {traversalOutput && traversalOutput.length > 0 && (
        <div className="w-full mb-3 p-2 bg-slate-100 dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white flex items-center gap-2 overflow-x-auto shadow-inner border border-slate-200 dark:border-slate-800 transition-colors">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap pl-2">
            OUTPUT:
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            {traversalOutput.map((val, idx) => (
              <motion.span
                key={`traversal-out-${idx}-${val}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 rounded-lg text-xs font-mono font-bold"
              >
                {val}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="w-full bg-slate-50/60 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 flex items-center justify-center relative overflow-hidden min-h-[260px] sm:min-h-[290px] transition-colors">
        {/* Subtle coordinate grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <svg
          viewBox="0 0 540 250"
          className="w-full max-w-[540px] h-auto select-none"
        >
          {/* Defs for markers */}
          <defs>
            <marker
              id="arrow-severed"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
            </marker>
          </defs>

          {/* Edges */}
          <g className="edges">
            {edges.map((edge, idx) => {
              const fromNode = nodeMap.get(edge.fromId);
              const toNode = nodeMap.get(edge.toId);
              if (!fromNode || !toNode) return null;

              const style = getEdgeStyle(edge.state);

              return (
                <g key={`edge-${edge.fromId}-${edge.toId}-${idx}`}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: style.opacity }}
                    transition={{ duration: 0.4 }}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                  />

                  {edge.state === 'severed' && (
                    <circle
                      cx={(fromNode.x + toNode.x) / 2}
                      cy={(fromNode.y + toNode.y) / 2}
                      r="7"
                      fill="#F43F5E"
                    />
                  )}
                  {edge.state === 'severed' && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 3}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ×
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const colors = getNodeColors(node.state);
              const isSelected = selectedNodeId === node.id;

              return (
                <g
                  key={`node-${node.id}`}
                  onClick={() => onNodeClick && onNodeClick(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer pulse / glow for active or found */}
                  {(node.state === 'active' || node.state === 'found' || node.state === 'successor' || node.state === 'target') && (
                    <motion.circle
                      animate={{ r: [22, 28, 22], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      cx={node.x}
                      cy={node.y}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth="2"
                    />
                  )}

                  {/* Base Circle */}
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 22 : 19}
                    fill={colors.fill}
                    stroke={isSelected ? '#3b82f6' : colors.stroke}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Value Text */}
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.value}
                  </text>

                  {/* Top Badge (if any) */}
                  {node.badge && (
                    <g transform={`translate(${node.x}, ${node.y - 23})`}>
                      <rect
                        x="-24"
                        y="-8"
                        width="48"
                        height="13"
                        rx="4"
                        fill={isDark ? '#0f172a' : '#0F172A'}
                        stroke={isDark ? '#334155' : 'none'}
                        strokeWidth="1"
                        className="opacity-90"
                      />
                      <text
                        x="0"
                        y="1.5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="7.5"
                        fontWeight="bold"
                        letterSpacing="0.05em"
                      >
                        {node.badge}
                      </text>
                    </g>
                  )}

                  {/* Null Pointer Stubs */}
                  {node.showNullLeft && (
                    <g transform={`translate(${node.x - 20}, ${node.y + 16})`}>
                      <line x1="0" y1="0" x2="-8" y2="8" stroke={isDark ? '#475569' : '#94A3B8'} strokeWidth="1.5" strokeDasharray="2,2" />
                      <text x="-12" y="15" fontSize="7.5" fill={isDark ? '#64748b' : '#94A3B8'} fontWeight="bold">null</text>
                    </g>
                  )}
                  {node.showNullRight && (
                    <g transform={`translate(${node.x + 20}, ${node.y + 16})`}>
                      <line x1="0" y1="0" x2="8" y2="8" stroke={isDark ? '#475569' : '#94A3B8'} strokeWidth="1.5" strokeDasharray="2,2" />
                      <text x="12" y="15" fontSize="7.5" fill={isDark ? '#64748b' : '#94A3B8'} fontWeight="bold">null</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

