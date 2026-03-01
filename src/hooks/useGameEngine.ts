import { useState, useCallback, useRef, useEffect } from 'react';
import { getRandomArticles, fetchPageHtml, fetchPageExtract, normalizeTitle, formatTitle, type WikiPage } from '@/lib/wikipedia';
import { type Difficulty, calculateScore, loadPlayerStats, savePlayerStats, getLevelFromPoints, getRank, HINT_COST, type ScoreResult } from '@/lib/scoring';
import { getDailyChallenge } from '@/lib/dailyChallenge';
import { supabase } from '@/integrations/supabase/client';

export type GameStatus = 'idle' | 'loading' | 'playing' | 'won' | 'tutorial';

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
  coins: number;
  hintUsed: boolean;
  tutorialComplete: boolean;
  targetExtract: string;
  isDailyChallenge: boolean;
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
  coins: stats.coins,
  hintUsed: false,
  tutorialComplete: stats.tutorialComplete,
  targetExtract: '',
  isDailyChallenge: false,
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

  const quitGame = useCallback(() => {
    stopTimer();
    setState(prev => ({
      ...prev,
      status: 'idle',
      currentPage: null,
      path: [],
      moves: 0,
      elapsedSeconds: 0,
      isNavigating: false,
      lastScore: null,
      hintUsed: false,
      targetExtract: '',
      isDailyChallenge: false,
    }));
  }, [stopTimer]);

  const startNewGame = useCallback(async (difficulty?: Difficulty) => {
    stopTimer();
    const diff = difficulty || state.difficulty;
    setState(prev => ({ ...prev, status: 'loading', difficulty: diff }));

    try {
      const [startTitle, targetTitle] = await getRandomArticles(2, diff);
      const [page, extract] = await Promise.all([
        fetchPageHtml(startTitle),
        fetchPageExtract(targetTitle),
      ]);
      
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
        hintUsed: false,
        targetExtract: extract,
        isDailyChallenge: false,
      }));
      startTimer();
    } catch (err) {
      console.error('Failed to start game:', err);
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  }, [startTimer, stopTimer, state.difficulty]);

  const startDailyChallenge = useCallback(async () => {
    stopTimer();
    setState(prev => ({ ...prev, status: 'loading' }));

    try {
      const challenge = await getDailyChallenge();
      const [page, extract] = await Promise.all([
        fetchPageHtml(challenge.start),
        fetchPageExtract(challenge.target),
      ]);

      setState(prev => ({
        ...prev,
        status: 'playing',
        startTitle: formatTitle(challenge.start),
        targetTitle: formatTitle(challenge.target),
        currentPage: page,
        path: [formatTitle(challenge.start)],
        moves: 0,
        elapsedSeconds: 0,
        isNavigating: false,
        lastScore: null,
        difficulty: 'medium',
        hintUsed: false,
        targetExtract: extract,
        isDailyChallenge: true,
      }));
      startTimer();
    } catch (err) {
      console.error('Failed to start daily challenge:', err);
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  }, [startTimer, stopTimer]);

  const startTutorial = useCallback(async () => {
    stopTimer();
    setState(prev => ({ ...prev, status: 'loading' }));

    try {
      const [page, extract] = await Promise.all([
        fetchPageHtml('Dog'),
        fetchPageExtract('Animal'),
      ]);
      setState(prev => ({
        ...prev,
        status: 'tutorial',
        startTitle: 'Dog',
        targetTitle: 'Animal',
        currentPage: page,
        path: ['Dog'],
        moves: 0,
        elapsedSeconds: 0,
        isNavigating: false,
        lastScore: null,
        difficulty: 'easy',
        hintUsed: false,
        targetExtract: extract,
        isDailyChallenge: false,
      }));
      startTimer();
    } catch (err) {
      console.error('Failed to start tutorial:', err);
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  }, [startTimer, stopTimer]);

  const useHint = useCallback(() => {
    setState(prev => {
      if (prev.coins < HINT_COST || prev.hintUsed) return prev;
      const newCoins = prev.coins - HINT_COST;
      const newStats = loadPlayerStats();
      newStats.coins = newCoins;
      savePlayerStats(newStats);
      return { ...prev, coins: newCoins, hintUsed: true };
    });
  }, []);

  const saveGameToHistory = useCallback(async (gameState: GameState, score: ScoreResult) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('game_history').insert({
      user_id: session.user.id,
      start_title: gameState.startTitle,
      target_title: gameState.targetTitle,
      path: gameState.path,
      moves: gameState.moves + 1,
      elapsed_seconds: gameState.elapsedSeconds,
      difficulty: gameState.difficulty,
      points_earned: score.points,
      coins_earned: score.coinsEarned,
      hint_used: gameState.hintUsed,
      is_daily_challenge: gameState.isDailyChallenge,
    });

    // Sync profile
    await supabase.from('profiles').update({
      total_points: gameState.totalPoints + score.points,
      coins: gameState.coins + score.coinsEarned,
      games_played: gameState.gamesPlayed + 1,
      level: getLevelFromPoints(gameState.totalPoints + score.points),
      rank: getRank(getLevelFromPoints(gameState.totalPoints + score.points)).name,
    }).eq('user_id', session.user.id);
  }, []);

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
          const isTutorial = prev.status === 'tutorial';
          const score = calculateScore(prev.moves + 1, prev.elapsedSeconds, prev.difficulty);
          const newTotal = prev.totalPoints + score.points;
          const newCoins = prev.coins + score.coinsEarned;
          const newLevel = getLevelFromPoints(newTotal);
          const newRank = getRank(newLevel);
          const newGames = prev.gamesPlayed + 1;
          
          savePlayerStats({
            totalPoints: newTotal,
            gamesPlayed: newGames,
            level: newLevel,
            rank: newRank.name,
            coins: newCoins,
            tutorialComplete: isTutorial ? true : prev.tutorialComplete,
          });

          // Save to DB async
          saveGameToHistory(prev, score);
          
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
            coins: newCoins,
            tutorialComplete: isTutorial ? true : prev.tutorialComplete,
          };
        }

        return {
          ...prev,
          currentPage: page,
          path: newPath,
          moves: prev.moves + 1,
          status: prev.status,
          isNavigating: false,
        };
      });
    } catch (err) {
      console.error('Failed to navigate:', err);
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [stopTimer, saveGameToHistory]);

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
    startTutorial,
    startDailyChallenge,
    navigateToPage,
    goBack,
    useHint,
    quitGame,
  };
}
