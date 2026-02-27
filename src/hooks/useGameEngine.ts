import { useState, useCallback, useRef, useEffect } from 'react';
import { getRandomArticles, fetchPageHtml, normalizeTitle, formatTitle, type WikiPage } from '@/lib/wikipedia';
import { type Difficulty, calculateScore, loadPlayerStats, savePlayerStats, getLevelFromPoints, getRank, type ScoreResult } from '@/lib/scoring';

export type GameStatus = 'idle' | 'loading' | 'playing' | 'won';

export interface GameState {
  status: GameStatus;
  startTitle: string;
  targetTitle: string;
  currentPage: WikiPage | null;
  path: string[];
  moves: number;
  elapsedSeconds: number;
  isNavigating: boolean;
  difficulty: Difficulty;
  lastScore: ScoreResult | null;
  totalPoints: number;
  level: number;
  rank: { name: string; icon: string };
  gamesPlayed: number;
}

const stats = loadPlayerStats();

const initialState: GameState = {
  status: 'idle',
  startTitle: '',
  targetTitle: '',
  currentPage: null,
  path: [],
  moves: 0,
  elapsedSeconds: 0,
  isNavigating: false,
  difficulty: 'medium',
  lastScore: null,
  totalPoints: stats.totalPoints,
  level: getLevelFromPoints(stats.totalPoints),
  rank: getRank(getLevelFromPoints(stats.totalPoints)),
  gamesPlayed: stats.gamesPlayed,
};

export function useGameEngine() {
  const [state, setState] = useState<GameState>(initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const startNewGame = useCallback(async (difficulty?: Difficulty) => {
    stopTimer();
    const diff = difficulty || state.difficulty;
    setState(prev => ({ ...prev, status: 'loading', difficulty: diff }));

    try {
      const [startTitle, targetTitle] = await getRandomArticles(2, diff);
      const page = await fetchPageHtml(startTitle);
      
      setState(prev => ({
        ...prev,
        status: 'playing',
        startTitle: formatTitle(startTitle),
        targetTitle: formatTitle(targetTitle),
        currentPage: page,
        path: [formatTitle(startTitle)],
        moves: 0,
        elapsedSeconds: 0,
        isNavigating: false,
        lastScore: null,
      }));
      startTimer();
    } catch (err) {
      console.error('Failed to start game:', err);
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  }, [startTimer, stopTimer, state.difficulty]);

  const navigateToPage = useCallback(async (title: string) => {
    const displayTitle = formatTitle(title);
    
    setState(prev => {
      if (prev.isNavigating) return prev;
      return { ...prev, isNavigating: true };
    });

    try {
      const page = await fetchPageHtml(normalizeTitle(title));
      
      setState(prev => {
        const newPath = [...prev.path, displayTitle];
        const isWin = normalizeTitle(displayTitle).toLowerCase() === normalizeTitle(prev.targetTitle).toLowerCase();
        
        if (isWin) {
          stopTimer();
          const score = calculateScore(prev.moves + 1, prev.elapsedSeconds, prev.difficulty);
          const newTotal = prev.totalPoints + score.points;
          const newLevel = getLevelFromPoints(newTotal);
          const newRank = getRank(newLevel);
          const newGames = prev.gamesPlayed + 1;
          
          savePlayerStats({ totalPoints: newTotal, gamesPlayed: newGames, level: newLevel, rank: newRank.name });
          
          return {
            ...prev,
            currentPage: page,
            path: newPath,
            moves: prev.moves + 1,
            status: 'won',
            isNavigating: false,
            lastScore: score,
            totalPoints: newTotal,
            level: newLevel,
            rank: newRank,
            gamesPlayed: newGames,
          };
        }

        return {
          ...prev,
          currentPage: page,
          path: newPath,
          moves: prev.moves + 1,
          status: 'playing',
          isNavigating: false,
        };
      });
    } catch (err) {
      console.error('Failed to navigate:', err);
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [stopTimer]);

  const goBack = useCallback(async () => {
    setState(prev => {
      if (prev.path.length <= 1) return prev;
      return { ...prev, isNavigating: true };
    });

    const prevTitle = state.path[state.path.length - 2];
    if (!prevTitle) return;

    try {
      const page = await fetchPageHtml(normalizeTitle(prevTitle));
      setState(prev => ({
        ...prev,
        currentPage: page,
        path: prev.path.slice(0, -1),
        moves: prev.moves + 1,
        isNavigating: false,
      }));
    } catch (err) {
      console.error('Failed to go back:', err);
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [state.path]);

  return {
    state,
    startNewGame,
    navigateToPage,
    goBack,
  };
}
