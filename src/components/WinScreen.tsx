import { Trophy, Clock, Footprints, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WinScreenProps {
  moves: number;
  elapsedSeconds: number;
  path: string[];
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function WinScreen({ moves, elapsedSeconds, path, onRestart }: WinScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
      <div className="max-w-lg w-full mx-4 animate-scale-in">
        <div className="bg-card border border-primary/30 rounded-xl p-8 glow-primary text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>

          <h2 className="font-mono text-3xl font-bold text-primary glow-text mb-2">
            MAZE COMPLETE
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            You found the path!
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <Footprints className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className="font-mono text-2xl font-bold text-foreground">{moves}</div>
              <div className="text-xs text-muted-foreground font-mono">Moves</div>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className="font-mono text-2xl font-bold text-foreground">{formatTime(elapsedSeconds)}</div>
              <div className="text-xs text-muted-foreground font-mono">Time</div>
            </div>
          </div>

          {/* Path display */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8 max-h-48 overflow-y-auto text-left">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Your Path</div>
            <div className="space-y-1">
              {path.map((title, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-primary shrink-0" />}
                  <span className={`text-xs font-mono ${
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold px-8"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
