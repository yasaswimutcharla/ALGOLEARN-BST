import React, { useState, useEffect, useRef } from 'react';
import { getTopicAnimation } from './animations/topicDataIndex';
import { TopicStageRenderer } from './animations/TopicStageRenderer';
import { SimpleAlgorithmSection } from './animations/SimpleAlgorithmSection';
import { getSimpleAlgorithmForTopic } from '../../data/simpleAlgorithmsData';
import { PredictStepModal } from './animations/PredictStepModal';
import { AnimationNodeInfo } from './animations/types';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2,
  Zap,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface DedicatedTopicVisualizerProps {
  topicNumber: number;
  speedMultiplier?: number;
  onNextTopic?: () => void;
  onPrevTopic?: () => void;
  hasNextTopic?: boolean;
  hasPrevTopic?: boolean;
  nextTopicTitle?: string;
  prevTopicTitle?: string;
}

export const DedicatedTopicVisualizer: React.FC<DedicatedTopicVisualizerProps> = ({
  topicNumber,
  speedMultiplier: initialSpeed = 1,
  onNextTopic,
  onPrevTopic,
  hasNextTopic = true,
  hasPrevTopic = false,
  nextTopicTitle,
  prevTopicTitle,
}) => {
  const topicData = getTopicAnimation(topicNumber);
  const totalSteps = topicData.steps.length;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPredictOpen, setIsPredictOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AnimationNodeInfo | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(initialSpeed);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state on topic switch
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsPredictOpen(false);
    setSelectedNode(null);
  }, [topicNumber]);

  const currentStep = topicData.steps[currentStepIndex] || topicData.steps[0];
  const simpleAlgorithm = getSimpleAlgorithmForTopic(topicNumber);

  // Auto-play timer that respects active speedMultiplier
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const baseInterval = 3200;
    const intervalTime = Math.max(600, baseInterval / (currentSpeed || 1));

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, currentSpeed]);

  const handlePrev = () => {
    soundManager.playClick();
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    soundManager.playClick();
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleRestart = () => {
    soundManager.playClick();
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const togglePlay = () => {
    soundManager.playClick();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStepIndex >= totalSteps - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  return (
    <div
      id="dedicated-topic-visualizer-container"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm shadow-indigo-500/5 space-y-4"
    >
      {/* Visualizer Header: Step Title, Badge & Jump Dots */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentStep.title}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{currentStep.currentStep || currentStep.title}</p>
        </div>

        {/* Step Jump Dots */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {topicData.steps.map((_, idx) => (
            <button
              key={idx}
              id={`step-dot-${idx}`}
              onClick={() => {
                soundManager.playClick();
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
              title={`Jump to step ${idx + 1}`}
              className={`transition-all rounded-full cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-6 h-2 bg-indigo-600 dark:bg-indigo-400 shadow-2xs'
                  : idx < currentStepIndex
                  ? 'w-2 h-2 bg-indigo-300 dark:bg-indigo-600 hover:bg-indigo-400'
                  : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Visual SVG Stage */}
      <TopicStageRenderer
        stepData={currentStep}
        onNodeClick={(node) => setSelectedNode(node)}
        selectedNodeId={selectedNode?.id}
      />

      {/* Unified Playback & Step Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Left side: Navigation controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="anim-prev-btn"
            disabled={currentStepIndex === 0}
            onClick={handlePrev}
            title="Previous Step"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Step</span>
          </button>

          <button
            id="anim-play-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause Animation' : 'Play Steps'}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-indigo-800 hover:bg-indigo-900 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Steps'}</span>
          </button>

          <button
            id="anim-next-btn"
            disabled={currentStepIndex === totalSteps - 1}
            onClick={handleNext}
            title="Next Step"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline">Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id="anim-restart-btn"
            onClick={handleRestart}
            title="Restart Animation"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Speed Multiplier & Guided Solve */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase px-1">
              Speed:
            </span>
            {([0.5, 1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                id={`visualizer-speed-${spd}x`}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentSpeed(spd);
                }}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  currentSpeed === spd
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Next Topic Option (Beside speed) */}
          {onNextTopic && (
            <button
              id="visualizer-next-topic-btn"
              disabled={hasNextTopic === false}
              onClick={() => {
                soundManager.playClick();
                onNextTopic();
              }}
              title={nextTopicTitle ? `Next Topic: ${nextTopicTitle}` : 'Go to Next Topic'}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs border border-indigo-600 dark:border-indigo-500 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs hover:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Topic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Predict Step Trigger */}
          {currentStep.prediction && (
            <button
              id="challenge-predict-btn"
              onClick={() => {
                soundManager.playClick();
                setIsPredictOpen(true);
              }}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Interactive Challenge</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>
              <strong>Selected Node {selectedNode.value}:</strong> State is{' '}
              <em className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">{selectedNode.state || 'default'}</em>.
              {selectedNode.badge ? ` Role: ${selectedNode.badge}.` : ''}
              {selectedNode.label ? ` Description: ${selectedNode.label}.` : ''}
            </span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Simple Algorithm Section Synchronized with the Animation */}
      <SimpleAlgorithmSection
        algorithm={simpleAlgorithm}
        currentStepIndex={currentStepIndex}
        totalAnimationSteps={totalSteps}
        onStepClick={(targetStep) => {
          setCurrentStepIndex(targetStep);
        }}
        className="mt-4"
      />

      {/* Interactive Predict Step Modal */}
      {currentStep.prediction && (
        <PredictStepModal
          isOpen={isPredictOpen}
          onClose={() => setIsPredictOpen(false)}
          predictionData={currentStep.prediction}
          onCorrectAnswer={() => {
            soundManager.playSuccess();
          }}
        />
      )}
    </div>
  );
};
