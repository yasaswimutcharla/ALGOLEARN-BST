import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Badge, UserStats, TeamGameRecord } from '../types';
import { ALL_BADGES } from '../data/badgesData';
import { soundManager } from '../utils/audio';
import { triggerActivityReset } from '../utils/activityReset';

export type ProfileMode = 'main' | 'demo';

const STORAGE_KEY_MAIN = 'bst_explorer_user_stats_main';
const STORAGE_KEY_DEMO = 'bst_explorer_user_stats_demo';
const STORAGE_KEY_PROFILE_MODE = 'bst_explorer_profile_mode';
const STORAGE_KEY_TEAMS = 'bst_explorer_teams_list_v1';
const STORAGE_KEY_ACTIVE_TEAM = 'bst_explorer_active_team_v1';
const STORAGE_KEY_TEAM_RECORDS = 'bst_explorer_team_records_v1';
const LEGACY_STORAGE_KEY = 'bst_explorer_user_stats_v1';

const DEFAULT_TEAMS = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

export interface UserProgressContextType {
  stats: UserStats;
  quizAnsweredCount: number;
  updateQuizProgress: (confirmedAnswers: (number | null)[]) => void;
  profileMode: ProfileMode;
  setProfileMode: (mode: ProfileMode) => void;
  addXP: (amount: number, reason?: string) => void;
  completeLesson: (lessonId: string) => void;
  completePractice: (practiceId: string) => void;
  completeGameChallenge: (challengeId: string) => void;
  recordQuizScore: (scorePercentage: number) => void;
  updateGameScore: (gameKey: 'rush' | 'detective' | 'speedrun', score: number) => void;
  unlockBadge: (badgeId: string) => void;
  setUserName: (name: string) => void;
  resetProgress: () => void;
  startFromZero: () => void;
  continueMyProgress: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  recentXPNotice: { amount: number; reason: string } | null;
  newBadgeUnlocked: Badge | null;
  clearNewBadge: () => void;
  getLevelTitle: (level: number) => string;
  calculateOverallProgress: () => number;
  // Team gameplay features
  activeTeam: string;
  setActiveTeam: (teamName: string) => void;
  availableTeams: string[];
  addTeam: (teamName: string) => void;
  recordTeamGameResult: (record: TeamGameRecord) => void;
  getTeamGameRecords: (teamName?: string) => TeamGameRecord[];
  // Modal state
  isStartFromZeroModalOpen: boolean;
  openStartFromZeroModal: () => void;
  closeStartFromZeroModal: () => void;
  justResetFlag: boolean;
  clearJustResetFlag: () => void;
}

// Brand new 0% clean-slate stats for demo / start from zero
export const zeroStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  completedPractice: [],
  completedGameChallenges: [],
  quizScores: {},
  unlockedBadges: [],
  userName: 'BST Explorer',
  skillMastery: {
    basics: 0,
    insertion: 0,
    searching: 0,
    leafDeletion: 0,
    oneChildDeletion: 0,
    twoChildDeletion: 0,
    successor: 0,
    predecessor: 0,
    traversals: 0,
    heightDepth: 0,
    complexity: 0,
  },
};

// Default clean-slate progress for My Progress profile
export const defaultMainProgressStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  completedPractice: [],
  completedGameChallenges: [],
  quizScores: {},
  unlockedBadges: [],
  userName: 'BST Explorer',
  skillMastery: {
    basics: 0,
    insertion: 0,
    searching: 0,
    leafDeletion: 0,
    oneChildDeletion: 0,
    twoChildDeletion: 0,
    successor: 0,
    predecessor: 0,
    traversals: 0,
    heightDepth: 0,
    complexity: 0,
  },
};

const normalizeStats = (saved: any, fallback: UserStats): UserStats => {
  if (!saved || typeof saved !== 'object') return fallback;
  let completed = Array.isArray(saved.completedLessons) ? saved.completedLessons : fallback.completedLessons;
  
  // Clean out legacy mock data if present
  if (
    completed.length === 8 &&
    completed[0] === 'lesson-1' &&
    completed[1] === 'lesson-2' &&
    completed[2] === 'lesson-3' &&
    completed[3] === 'lesson-4' &&
    completed[4] === 'lesson-5' &&
    completed[5] === 'lesson-6' &&
    completed[6] === 'lesson-7' &&
    completed[7] === 'lesson-8' &&
    saved.xp === 380
  ) {
    completed = [];
  }

  const isLegacyMock = saved.xp === 380 && saved.level === 3 && saved.streak === 3 && completed.length === 0;

  return {
    ...fallback,
    ...saved,
    xp: typeof saved.xp === 'number' ? (isLegacyMock ? 0 : saved.xp) : fallback.xp,
    level: typeof saved.level === 'number' ? (isLegacyMock ? 1 : saved.level) : fallback.level,
    streak: typeof saved.streak === 'number' ? (isLegacyMock ? 0 : saved.streak) : fallback.streak,
    lastActiveDate: typeof saved.lastActiveDate === 'string' ? saved.lastActiveDate : fallback.lastActiveDate,
    completedLessons: completed,
    completedPractice: Array.isArray(saved.completedPractice) ? (isLegacyMock ? [] : saved.completedPractice) : fallback.completedPractice,
    completedGameChallenges: Array.isArray(saved.completedGameChallenges) ? (isLegacyMock ? [] : saved.completedGameChallenges) : fallback.completedGameChallenges,
    quizScores: (saved.quizScores && typeof saved.quizScores === 'object') ? (isLegacyMock ? {} : saved.quizScores) : fallback.quizScores,
    unlockedBadges: Array.isArray(saved.unlockedBadges) ? (isLegacyMock ? [] : saved.unlockedBadges) : fallback.unlockedBadges,
    userName: typeof saved.userName === 'string' ? saved.userName : fallback.userName,
    skillMastery: (saved.skillMastery && typeof saved.skillMastery === 'object') ? { ...fallback.skillMastery, ...(isLegacyMock ? {} : saved.skillMastery) } : fallback.skillMastery,
  };
};

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{
  children: React.ReactNode;
  onNavigateHome?: () => void;
}> = ({ children, onNavigateHome }) => {
  // Current active mode: 'main' or 'demo'
  const [profileMode, setProfileModeState] = useState<ProfileMode>(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_PROFILE_MODE) as ProfileMode;
      if (savedMode === 'demo' || savedMode === 'main') {
        return savedMode;
      }
    } catch {}
    return 'main';
  });

  // Main profile stats
  const [mainStats, setMainStats] = useState<UserStats>(() => {
    try {
      const savedMain = localStorage.getItem(STORAGE_KEY_MAIN);
      if (savedMain) {
        return normalizeStats(JSON.parse(savedMain), defaultMainProgressStats);
      }
      // Check legacy key
      const savedLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedLegacy) {
        return normalizeStats(JSON.parse(savedLegacy), defaultMainProgressStats);
      }
    } catch {}
    return defaultMainProgressStats;
  });

  // Demo profile stats (0% clean slate)
  const [demoStats, setDemoStats] = useState<UserStats>(() => {
    try {
      const savedDemo = localStorage.getItem(STORAGE_KEY_DEMO);
      if (savedDemo) {
        return normalizeStats(JSON.parse(savedDemo), zeroStats);
      }
    } catch {}
    return zeroStats;
  });

  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [recentXPNotice, setRecentXPNotice] = useState<{ amount: number; reason: string } | null>(null);
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState<Badge | null>(null);
  const [isStartFromZeroModalOpen, setIsStartFromZeroModalOpen] = useState<boolean>(false);
  const [justResetFlag, setJustResetFlag] = useState<boolean>(false);

  // Shared Quiz answered questions count (0 to 10) synchronized across Quiz, Learn, and Navigation
  const [quizAnsweredCount, setQuizAnsweredCount] = useState<number>(() => {
    try {
      const raw = sessionStorage.getItem('bst_quiz_session_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.confirmedAnswers)) {
          return parsed.confirmedAnswers.filter((ans: any) => ans !== null).length;
        }
      }
    } catch {}
    return 0;
  });

  const updateQuizProgress = (confirmedAnswers: (number | null)[]) => {
    const count = Array.isArray(confirmedAnswers)
      ? confirmedAnswers.filter((ans) => ans !== null).length
      : 0;
    setQuizAnsweredCount(count);
  };

  // Teams support
  const [availableTeams, setAvailableTeams] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TEAMS;
  });

  const [activeTeam, setActiveTeamState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TEAM);
      if (saved && typeof saved === 'string') return saved;
    } catch {}
    return DEFAULT_TEAMS[0];
  });

  const [teamRecords, setTeamRecords] = useState<Record<string, TeamGameRecord[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAM_RECORDS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {};
  });

  // Persist teams
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(availableTeams));
    } catch {}
  }, [availableTeams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TEAM, activeTeam);
    } catch {}
  }, [activeTeam]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAM_RECORDS, JSON.stringify(teamRecords));
    } catch {}
  }, [teamRecords]);

  const setActiveTeam = (teamName: string) => {
    soundManager.playClick();
    setActiveTeamState(teamName);
  };

  const addTeam = (newTeamName: string) => {
    const trimmed = newTeamName.trim();
    if (!trimmed) return;
    if (!availableTeams.includes(trimmed)) {
      soundManager.playSuccess();
      setAvailableTeams((prev) => [...prev, trimmed]);
      setActiveTeamState(trimmed);
    }
  };

  const recordTeamGameResult = (record: TeamGameRecord) => {
    const team = record.teamName || activeTeam;
    setTeamRecords((prev) => {
      const existing = prev[team] || [];
      // Replace existing record for same level if higher score, or append
      const otherLevels = existing.filter((r) => r.level !== record.level);
      const updatedList = [...otherLevels, record].sort((a, b) => a.level - b.level);
      return {
        ...prev,
        [team]: updatedList,
      };
    });
  };

  const getTeamGameRecords = (teamName?: string): TeamGameRecord[] => {
    if (teamName) {
      return teamRecords[teamName] || [];
    }
    return teamRecords[activeTeam] || [];
  };

  // Active stats depends on profileMode
  const stats = profileMode === 'main' ? mainStats : demoStats;

  // Persist Profile Mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE_MODE, profileMode);
    } catch {}
  }, [profileMode]);

  // Persist Main Stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(mainStats));
    } catch {}
  }, [mainStats]);

  // Persist Demo Stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEMO, JSON.stringify(demoStats));
    } catch {}
  }, [demoStats]);

  // Mutator for the active profile
  const setActiveStats = (updater: (prev: UserStats) => UserStats) => {
    if (profileMode === 'main') {
      setMainStats(updater);
    } else {
      setDemoStats(updater);
    }
  };

  // Switch profile mode cleanly
  const setProfileMode = (mode: ProfileMode) => {
    soundManager.playClick();
    setProfileModeState(mode);
  };

  // Start from zero
  const startFromZero = () => {
    soundManager.playSuccess();
    const freshZero: UserStats = {
      ...zeroStats,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    try {
      sessionStorage.removeItem('bst_quiz_session_state');
      localStorage.removeItem('bst_quiz_session_state');
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(freshZero));
      localStorage.setItem(STORAGE_KEY_DEMO, JSON.stringify(freshZero));
      localStorage.setItem(STORAGE_KEY_PROFILE_MODE, 'demo');
    } catch {}
    setQuizAnsweredCount(0);
    setMainStats(freshZero);
    setDemoStats(freshZero);
    setProfileModeState('demo');
    setJustResetFlag(true);
    setIsStartFromZeroModalOpen(false);
    triggerActivityReset();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bst-reset-progress'));
    }

    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  // Continue My Progress
  const continueMyProgress = () => {
    soundManager.playClick();
    setProfileModeState('main');
    setJustResetFlag(false);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE_MODE, 'main');
    } catch {}
  };

  const openStartFromZeroModal = () => {
    setIsStartFromZeroModalOpen(true);
  };

  const closeStartFromZeroModal = () => {
    setIsStartFromZeroModalOpen(false);
  };

  const clearJustResetFlag = () => {
    setJustResetFlag(false);
  };

  // Handle daily streak update
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastActiveDate !== today) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setActiveStats((prev) => {
        let newStreak = prev.streak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
        return { ...prev, streak: newStreak, lastActiveDate: today };
      });
    }
  }, [stats.lastActiveDate]);

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const getLevelTitle = (level: number): string => {
    if (level <= 1) return 'Binary Novice';
    if (level === 2) return 'Node Explorer';
    if (level === 3) return 'Tree Architect';
    if (level === 4) return 'Binary Specialist';
    if (level === 5) return 'BST Virtuoso';
    return 'BST Grandmaster';
  };

  const calculateLevelFromXP = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 450) return 3;
    if (xp < 700) return 4;
    if (xp < 1000) return 5;
    return 6;
  };

  const addXP = (amount: number, reason = 'Activity completed') => {
    soundManager.playStep(4);
    setRecentXPNotice({ amount, reason });
    setTimeout(() => {
      setRecentXPNotice(null);
    }, 3000);

    setActiveStats((prev) => {
      const newXP = prev.xp + amount;
      const oldLevel = prev.level;
      const newLevel = calculateLevelFromXP(newXP);

      if (newLevel > oldLevel) {
        soundManager.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  const unlockBadge = (badgeId: string) => {
    const badge = ALL_BADGES.find((b) => b.id === badgeId);
    if (!badge) return;

    setActiveStats((prev) => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      const updatedBadges = [...prev.unlockedBadges, badgeId];

      soundManager.playSuccess();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      setNewBadgeUnlocked(badge);

      return {
        ...prev,
        unlockedBadges: updatedBadges,
        xp: prev.xp + badge.xpBonus,
      };
    });
  };

  const completeLesson = (lessonId: string) => {
    setActiveStats((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const updated = [...prev.completedLessons, lessonId];
      if (updated.length === 1) {
        setTimeout(() => unlockBadge('first-step'), 600);
      }
      if (lessonId === 'lesson-2') {
        setTimeout(() => unlockBadge('bst-rule-master'), 600);
      }
      if (lessonId === 'lesson-3') {
        setTimeout(() => unlockBadge('search-scout'), 600);
      }
      if (lessonId === 'lesson-5') {
        setTimeout(() => unlockBadge('inorder-virtuoso'), 600);
      }
      if (lessonId === 'lesson-7') {
        setTimeout(() => unlockBadge('tree-surgeon'), 600);
      }
      if (lessonId === 'lesson-8') {
        setTimeout(() => unlockBadge('perfect-balance'), 600);
      }
      return { ...prev, completedLessons: updated };
    });
  };

  const completePractice = (practiceId: string) => {
    setActiveStats((prev) => {
      if (prev.completedPractice.includes(practiceId)) return prev;
      const updated = [...prev.completedPractice, practiceId];
      if (updated.length >= 3) {
        setTimeout(() => unlockBadge('practice-champion'), 600);
      }
      return { ...prev, completedPractice: updated };
    });
  };

  const completeGameChallenge = (challengeId: string) => {
    setActiveStats((prev) => {
      const prevChallenges = prev.completedGameChallenges || [];
      if (prevChallenges.includes(challengeId)) return prev;
      const updated = [...prevChallenges, challengeId];
      if (updated.length >= 1) {
        setTimeout(() => unlockBadge('game-striker'), 600);
      }
      return { ...prev, completedGameChallenges: updated };
    });
  };

  const recordQuizScore = (scorePercentage: number) => {
    setActiveStats((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        mainQuiz: Math.max(prev.quizScores.mainQuiz || 0, scorePercentage),
      },
    }));
    if (scorePercentage >= 80) {
      setTimeout(() => unlockBadge('quiz-ace'), 600);
    }
  };

  const updateGameScore = (gameKey: 'rush' | 'detective' | 'speedrun', score: number) => {
    setActiveStats((prev) => {
      if (score > 0) {
        setTimeout(() => unlockBadge('game-striker'), 600);
      }
      return prev;
    });
  };

  const setUserName = (name: string) => {
    setActiveStats((prev) => ({ ...prev, userName: name.trim() || 'BST Explorer' }));
  };

  const resetProgress = () => {
    soundManager.playSuccess();
    const freshZero: UserStats = {
      ...zeroStats,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    try {
      sessionStorage.removeItem('bst_quiz_session_state');
      localStorage.removeItem('bst_quiz_session_state');
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(freshZero));
      localStorage.setItem(STORAGE_KEY_DEMO, JSON.stringify(freshZero));
      localStorage.setItem(STORAGE_KEY_PROFILE_MODE, 'main');
    } catch {}
    setQuizAnsweredCount(0);
    setMainStats(freshZero);
    setDemoStats(freshZero);
    setProfileModeState('main');
    setJustResetFlag(true);
    triggerActivityReset();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bst-reset-progress'));
    }
  };

  const calculateOverallProgress = (): number => {
    // 6 lessons, 3 practice, 5 game, 10 quiz = 24 total items
    const learnScore = Math.min(stats?.completedLessons?.length || 0, 6);
    const practiceScore = Math.min(stats?.completedPractice?.length || 0, 3);
    const gameScore = Math.min(stats?.completedGameChallenges?.length || 0, 5);
    const quizScore = Math.min(quizAnsweredCount || 0, 10);
    const totalDone = learnScore + practiceScore + gameScore + quizScore;

    const total = Math.min(100, Math.round((totalDone / 24) * 100));
    if (total === 100) {
      setTimeout(() => unlockBadge('bst-grandmaster'), 1000);
    }
    return total;
  };

  const clearNewBadge = () => {
    setNewBadgeUnlocked(null);
  };

  return (
    <UserProgressContext.Provider
      value={{
        stats,
        quizAnsweredCount,
        updateQuizProgress,
        profileMode,
        setProfileMode,
        addXP,
        completeLesson,
        completePractice,
        completeGameChallenge,
        recordQuizScore,
        updateGameScore,
        unlockBadge,
        setUserName,
        resetProgress,
        startFromZero,
        continueMyProgress,
        isMuted,
        toggleMute,
        recentXPNotice,
        newBadgeUnlocked,
        clearNewBadge,
        getLevelTitle,
        calculateOverallProgress,
        activeTeam,
        setActiveTeam,
        availableTeams,
        addTeam,
        recordTeamGameResult,
        getTeamGameRecords,
        isStartFromZeroModalOpen,
        openStartFromZeroModal,
        closeStartFromZeroModal,
        justResetFlag,
        clearJustResetFlag,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};

