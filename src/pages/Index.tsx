import { useGameEngine } from '@/hooks/useGameEngine';
import { StartScreen } from '@/components/StartScreen';
import { GameHeader } from '@/components/GameHeader';
import { WikiViewer } from '@/components/WikiViewer';
import { PathSidebar } from '@/components/PathSidebar';
import { MobilePathDrawer } from '@/components/MobilePathDrawer';
import { WinScreen } from '@/components/WinScreen';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import type { Difficulty } from '@/lib/scoring';

const Index = () => {
  const { state, startNewGame, navigateToPage, goBack } = useGameEngine();

  if (state.status === 'idle' || state.status === 'loading') {
    return <StartScreen onStart={(d: Difficulty) => startNewGame(d)} isLoading={state.status === 'loading'} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <GameHeader
        startTitle={state.startTitle}
        targetTitle={state.targetTitle}
        moves={state.moves}
        elapsedSeconds={state.elapsedSeconds}
      />

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={state.path.length <= 1 || state.isNavigating}
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startNewGame()}
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          New Game
        </Button>
        <div className="flex-1" />
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
          state.difficulty === 'easy' ? 'text-primary border-primary/30' :
          state.difficulty === 'medium' ? 'text-warning border-warning/30' :
          'text-destructive border-destructive/30'
        }`}>
          {state.difficulty.toUpperCase()}
        </span>
        <span className="text-xs font-mono text-muted-foreground/50 hidden sm:block truncate max-w-[200px]">
          {state.currentPage?.title}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <WikiViewer
          page={state.currentPage}
          onNavigate={navigateToPage}
          isNavigating={state.isNavigating}
        />
        <PathSidebar
          path={state.path}
          targetTitle={state.targetTitle}
        />
      </div>

      {/* Mobile path drawer */}
      <MobilePathDrawer path={state.path} targetTitle={state.targetTitle} />

      {state.status === 'won' && (
        <WinScreen
          moves={state.moves}
          elapsedSeconds={state.elapsedSeconds}
          path={state.path}
          onRestart={() => startNewGame()}
          score={state.lastScore}
          totalPoints={state.totalPoints}
          level={state.level}
          rank={state.rank}
          difficulty={state.difficulty}
        />
      )}
    </div>
  );
};

export default Index;
