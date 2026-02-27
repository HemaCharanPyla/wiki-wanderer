import { useState, useCallback, useRef, useEffect } from 'react';
import { getRandomArticles, fetchPageHtml, normalizeTitle, formatTitle, type WikiPage } from '@/lib/wikipedia';

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
}

const initialState: GameState = {
  status: 'idle',
  startTitle: '',
  targetTitle: '',
  currentPage: null,
  path: [],
  moves: 0,
  elapsedSeconds: 0,
  isNavigating: false,
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

  const startNewGame = useCallback(async () => {
    stopTimer();
    setState(prev => ({ ...prev, status: 'loading' }));

    try {
      const [startTitle, targetTitle] = await getRandomArticles(2);
      const page = await fetchPageHtml(startTitle);
      
      setState({
        status: 'playing',
        startTitle: formatTitle(startTitle),
        targetTitle: formatTitle(targetTitle),
        currentPage: page,
        path: [formatTitle(startTitle)],
        moves: 0,
        elapsedSeconds: 0,
        isNavigating: false,
      });
      startTimer();
    } catch (err) {
      console.error('Failed to start game:', err);
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  }, [startTimer, stopTimer]);

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
        }

        return {
          ...prev,
          currentPage: page,
          path: newPath,
          moves: prev.moves + 1,
          status: isWin ? 'won' : 'playing',
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
