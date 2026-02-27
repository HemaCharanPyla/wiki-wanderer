import { useGameEngine } from '@/hooks/useGameEngine';
import { StartScreen } from '@/components/StartScreen';
import { GameHeader } from '@/components/GameHeader';
import { WikiViewer } from '@/components/WikiViewer';
import { PathSidebar } from '@/components/PathSidebar';
import { WinScreen } from '@/components/WinScreen';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft } from 'lucide-react';

const Index = () => {
  const { state, startNewGame, navigateToPage, goBack } = useGameEngine();

  if (state.status === 'idle' || state.status === 'loading') {
    return <StartScreen onStart={startNewGame} isLoading={state.status === 'loading'} />;
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
          onClick={startNewGame}
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          New Game
        </Button>
        <div className="flex-1" />
        <span className="text-xs font-mono text-muted-foreground/50">
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

      {state.status === 'won' && (
        <WinScreen
          moves={state.moves}
          elapsedSeconds={state.elapsedSeconds}
          path={state.path}
          onRestart={startNewGame}
        />
      )}
    </div>
  );
};

export default Index;
