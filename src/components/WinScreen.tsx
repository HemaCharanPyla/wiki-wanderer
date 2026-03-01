import { Trophy, Clock, Footprints, RotateCcw, ChevronRight, Star, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProgressToNextLevel } from '@/lib/scoring';
import type { Difficulty, ScoreResult } from '@/lib/scoring';

interface WinScreenProps {
  moves: number;
  elapsedSeconds: number;
  path: string[];
  onRestart: () => void;
  score: ScoreResult | null;
  totalPoints: number;
  level: number;
  rank: { name: string; icon: string };
  difficulty: Difficulty;
  coins: number;
  wasTutorial?: boolean;
  isDailyChallenge?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function WinScreen({ moves, elapsedSeconds, path, onRestart, score, totalPoints, level, rank, difficulty, coins, wasTutorial, isDailyChallenge }: WinScreenProps) {
  const progress = getProgressToNextLevel(totalPoints);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
      <div className="max-w-lg w-full animate-scale-in my-4">
        <div className="bg-card border border-primary/30 rounded-xl p-4 sm:p-8 glow-primary text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>

          <h2 className="font-mono text-2xl sm:text-3xl font-bold text-primary glow-text mb-1 sm:mb-2">
            {wasTutorial ? 'TUTORIAL COMPLETE!' : 'MAZE COMPLETE'}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-2">
            {wasTutorial ? 'You\'re ready to play!' : 'You found the path!'}
          </p>
          <span className={`inline-block font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded border mb-4 sm:mb-6 ${
            difficulty === 'easy' ? 'text-primary border-primary/30' :
            difficulty === 'medium' ? 'text-warning border-warning/30' :
            'text-destructive border-destructive/30'
          }`}>
            {difficulty.toUpperCase()} MODE
          </span>

          {/* Score & Coins */}
          {score && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="font-mono text-xl sm:text-3xl font-bold text-primary glow-text">+{score.points}</span>
                  <span className="font-mono text-xs sm:text-sm text-muted-foreground">XP</span>
                </div>
                <div className="w-px h-6 sm:h-8 bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  <span className="font-mono text-lg sm:text-2xl font-bold text-warning">+{score.coinsEarned}</span>
                </div>
              </div>
              <div className="flex justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-mono text-muted-foreground flex-wrap">
                <span>Move: +{score.moveBonus}</span>
                <span>Time: +{score.timeBonus}</span>
                <span>×{score.difficultyMultiplier}</span>
              </div>
            </div>
          )}

          {/* Level & Rank */}
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl">{rank.icon}</span>
                <span className="font-mono text-xs sm:text-sm font-bold text-foreground">{rank.name}</span>
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">Lv.{level}/100</span>
              </div>
              <div className="flex items-center gap-1 bg-warning/10 rounded px-1.5 sm:px-2 py-0.5">
                <Coins className="w-3 h-3 text-warning" />
                <span className="font-mono text-[10px] sm:text-xs font-bold text-warning">{coins}</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1 sm:h-1.5 mb-1">
              <div className="bg-primary h-1 sm:h-1.5 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground/50">{totalPoints} total XP</div>
          </div>

          <div className="flex justify-center gap-6 sm:gap-8 mb-4 sm:mb-6">
            <div className="text-center">
              <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-accent mx-auto mb-1" />
              <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">{moves}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">Moves</div>
            </div>
            <div className="text-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent mx-auto mb-1" />
              <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">{formatTime(elapsedSeconds)}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">Time</div>
            </div>
          </div>

          {/* Path display */}
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 max-h-28 sm:max-h-36 overflow-y-auto text-left">
            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">Your Path</div>
            <div className="space-y-1">
              {path.map((title, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                  {i > 0 && <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary shrink-0" />}
                  <span className={`text-[10px] sm:text-xs font-mono ${
                    i === 0 || i === path.length - 1 ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onRestart}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold px-8"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
