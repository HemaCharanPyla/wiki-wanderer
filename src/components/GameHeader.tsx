import { Target, ArrowRight, Zap, Coins } from 'lucide-react';

interface GameHeaderProps {
  startTitle: string;
  targetTitle: string;
  moves: number;
  elapsedSeconds: number;
  coins: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function GameHeader({ startTitle, targetTitle, moves, elapsedSeconds, coins }: GameHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 max-w-[1600px] mx-auto gap-2">
        {/* Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary/20 flex items-center justify-center glow-primary">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </div>
          <span className="font-mono text-sm sm:text-lg font-bold text-primary glow-text hidden md:block">
            WikiMaze
          </span>
        </div>

        {/* Navigation info - stacks vertically on very small screens */}
        <div className="flex items-center gap-1.5 sm:gap-4 flex-1 justify-center min-w-0 px-1 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider hidden md:block">From</span>
            <span className="font-mono text-[11px] sm:text-sm font-semibold text-foreground truncate max-w-[60px] sm:max-w-[120px] md:max-w-[200px]">
              {startTitle}
            </span>
          </div>
          
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0 animate-pulse-glow" />
          
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent shrink-0" />
            <span className="font-mono text-[11px] sm:text-sm font-bold text-accent truncate max-w-[60px] sm:max-w-[120px] md:max-w-[200px] glow-text">
              {targetTitle}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1 bg-warning/10 rounded px-1.5 sm:px-2 py-0.5 sm:py-1">
            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-warning" />
            <span className="font-mono text-xs sm:text-sm font-bold text-warning">{coins}</span>
          </div>
          <div className="text-center">
            <div className="text-[9px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">Moves</div>
            <div className="font-mono text-sm sm:text-lg font-bold text-foreground">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] sm:text-xs text-muted-foreground font-mono uppercase tracking-wider">Time</div>
            <div className="font-mono text-sm sm:text-lg font-bold text-foreground">{formatTime(elapsedSeconds)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
