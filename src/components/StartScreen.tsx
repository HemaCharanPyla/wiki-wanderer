import { Zap, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

export function StartScreen({ onStart, isLoading }: StartScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(150 80% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(150 80% 50%) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 text-center px-4 animate-scale-in">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 glow-primary">
          <Zap className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-mono text-5xl sm:text-6xl font-extrabold text-primary glow-text mb-4 tracking-tight">
          WikiMaze
        </h1>
        
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-3">
          Navigate from one Wikipedia article to another using only internal links.
        </p>
        
        <p className="text-muted-foreground/60 text-sm max-w-sm mx-auto mb-12 font-mono">
          Find the path. Beat the clock. Master the maze.
        </p>

        <Button
          onClick={onStart}
          disabled={isLoading}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold text-lg px-10 py-6 glow-primary transition-all hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </>
          )}
        </Button>

        <div className="mt-16 flex items-center justify-center gap-8 text-xs font-mono text-muted-foreground/40">
          <span>Click wiki links</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span>Find the target</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span>Fewest moves wins</span>
        </div>
      </div>
    </div>
  );
}
