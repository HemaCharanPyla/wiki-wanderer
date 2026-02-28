import { useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { StartScreen } from '@/components/StartScreen';
import { GameHeader } from '@/components/GameHeader';
import { WikiViewer } from '@/components/WikiViewer';
import { PathSidebar } from '@/components/PathSidebar';
import { MobilePathDrawer } from '@/components/MobilePathDrawer';
import { WinScreen } from '@/components/WinScreen';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft, Lightbulb, Coins } from 'lucide-react';
import { type Difficulty, HINT_COST } from '@/lib/scoring';

const Index = () => {
  const { state, startNewGame, startTutorial, navigateToPage, goBack, useHint } = useGameEngine();
  const [showTutorial, setShowTutorial] = useState(true);

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <StartScreen
        onStart={(d: Difficulty) => startNewGame(d)}
        onTutorial={startTutorial}
        isLoading={state.status === 'loading'}
      />
    );
  }

  const isTutorial = state.status === 'tutorial';

  return (
    <div className="h-screen flex flex-col bg-background">
      <GameHeader
        startTitle={state.startTitle}
        targetTitle={state.targetTitle}
        moves={state.moves}
        elapsedSeconds={state.elapsedSeconds}
        coins={state.coins}
      />

      {/* Action bar */}
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border-b border-border bg-card/30 overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={state.path.length <= 1 || state.isNavigating}
          className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-foreground shrink-0 px-2 sm:px-3"
        >
          <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startNewGame()}
          className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-foreground shrink-0 px-2 sm:px-3"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
          <span className="hidden sm:inline">New Game</span>
        </Button>

        {/* Hint button */}
        {!isTutorial && (
          <Button
            variant="ghost"
            size="sm"
            onClick={useHint}
            disabled={state.coins < HINT_COST || state.hintUsed}
            className={`font-mono text-[10px] sm:text-xs shrink-0 px-2 sm:px-3 ${state.hintUsed ? 'text-primary' : 'text-warning hover:text-warning'}`}
            title={state.hintUsed ? 'Hint active — look for the target in links!' : `Use hint (${HINT_COST} coins)`}
          >
            <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
            {state.hintUsed ? 'Hint' : `${HINT_COST}`}
            {!state.hintUsed && <Coins className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 text-warning" />}
          </Button>
        )}

        <div className="flex-1" />
        <span className={`text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded border shrink-0 ${
          state.difficulty === 'easy' ? 'text-primary border-primary/30' :
          state.difficulty === 'medium' ? 'text-warning border-warning/30' :
          'text-destructive border-destructive/30'
        }`}>
          {isTutorial ? 'TUT' : state.difficulty.toUpperCase()}
        </span>
        <span className="text-[10px] sm:text-xs font-mono text-muted-foreground/50 hidden md:block truncate max-w-[200px]">
          {state.currentPage?.title}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <WikiViewer
          page={state.currentPage}
          onNavigate={navigateToPage}
          isNavigating={state.isNavigating}
          hintActive={state.hintUsed}
          targetTitle={state.targetTitle}
        />
        <PathSidebar
          path={state.path}
          targetTitle={state.targetTitle}
        />
      </div>

      {/* Mobile path drawer */}
      <MobilePathDrawer path={state.path} targetTitle={state.targetTitle} />

      {/* Tutorial overlay */}
      {isTutorial && showTutorial && (
        <TutorialOverlay
          step={0}
          targetTitle={state.targetTitle}
          onDismiss={() => setShowTutorial(false)}
        />
      )}

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
          coins={state.coins}
          wasTutorial={!state.tutorialComplete}
        />
      )}
    </div>
  );
};

export default Index;
