import React, { useState } from 'react';
import { Header, NavTab } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { HomePage } from './components/home/HomePage';
import { LearnPage } from './components/learn/LearnPage';
import { VideoPage } from './components/video/VideoPage';
import { PracticePage } from './components/practice/PracticePage';
import { LabPage } from './components/lab/LabPage';
import { QuizPage } from './components/quiz/QuizPage';
import { GamePage } from './components/game/GamePage';
import { ResultsPage } from './components/results/ResultsPage';
import { BadgeModal } from './components/common/BadgeModal';
import { StartFromZeroModal } from './components/common/StartFromZeroModal';
import { FloatingChatBadge } from './components/common/FloatingChatBadge';
import { UserProgressProvider } from './context/UserProgressContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [selectedLearnTopicIndex, setSelectedLearnTopicIndex] = useState<number>(0);

  const handleSelectLearnTopic = (index: number) => {
    setSelectedLearnTopicIndex(index);
    setActiveTab('learn');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <ThemeProvider>
      <UserProgressProvider onNavigateHome={() => setActiveTab('home')}>
        <div
          id="bst-explorer-app"
          className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200"
        >
          {/* Collapsible Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            selectedLearnTopicIndex={selectedLearnTopicIndex}
            onSelectLearnTopic={handleSelectLearnTopic}
          />

          {/* Main Content Area (Offset by sidebar width when open) */}
          <div
            className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
              isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
            }`}
          >
            {/* Top Context Header */}
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onToggleSidebar={handleToggleSidebar}
              isSidebarOpen={isSidebarOpen}
            />

            {/* Main Views */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {activeTab === 'home' && (
                <HomePage
                  setActiveTab={setActiveTab}
                  onSelectTopic={handleSelectLearnTopic}
                />
              )}
              {activeTab === 'learn' && (
                <LearnPage
                  initialTopicIndex={selectedLearnTopicIndex}
                  onGoToPractice={() => setActiveTab('practice')}
                  onGoToGame={() => setActiveTab('game')}
                />
              )}
              {(activeTab === 'video' || activeTab === 'visual') && (
                <VideoPage />
              )}
              {activeTab === 'practice' && (
                <PracticePage onGoToQuiz={() => setActiveTab('quiz')} />
              )}
              {activeTab === 'lab' && <LabPage />}
              {activeTab === 'quiz' && (
                <QuizPage
                  onGoToGame={() => setActiveTab('game')}
                  onSelectTopic={(idx) => handleSelectLearnTopic(idx)}
                />
              )}
              {activeTab === 'game' && <GamePage />}
              {activeTab === 'results' && (
                <ResultsPage
                  onGoToHome={() => setActiveTab('home')}
                  onGoToLearn={(idx) => {
                    if (typeof idx === 'number') {
                      handleSelectLearnTopic(idx);
                    } else {
                      setActiveTab('learn');
                    }
                  }}
                  onGoToGame={() => setActiveTab('game')}
                  onGoToQuiz={() => setActiveTab('quiz')}
                  onGoToPractice={() => setActiveTab('practice')}
                />
              )}
            </main>

            {/* Global Modals */}
            <BadgeModal />
            <StartFromZeroModal onConfirmRedirect={() => setActiveTab('home')} />

            {/* Static Floating Chat Badge on bottom right of every page */}
            <FloatingChatBadge />

            {/* Clean Minimal Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors">
              <p>BST Explorer • Learn Binary Search Trees Visually • Learn • Think • Build</p>
            </footer>
          </div>
        </div>
      </UserProgressProvider>
    </ThemeProvider>
  );
}

