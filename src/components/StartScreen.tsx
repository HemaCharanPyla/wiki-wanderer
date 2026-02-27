import { useState } from 'react';
import { Zap, Play, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Difficulty, loadPlayerStats, getLevelFromPoints, getRank, getProgressToNextLevel } from '@/lib/scoring';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  isLoading: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Related topics', color: 'text-primary' },
  { value: 'medium', label: 'Medium', desc: 'Cross-domain', color: 'text-warning' },
  { value: 'hard', label: 'Hard', desc: 'Unrelated topics', color: 'text-destructive' },
];

export function StartScreen({ onStart, isLoading }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const stats = loadPlayerStats();
  const level = getLevelFromPoints(stats.totalPoints);
  const rank = getRank(level);
  const progress = getProgressToNextLevel(stats.totalPoints);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(150 80% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(150 80% 50%) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 text-center px-4 animate-scale-in max-w-md w-full">
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

        {/* Player Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">{rank.icon}</span>
              <div className="text-left">
                <div className="font-mono text-sm font-bold text-foreground">{rank.name}</div>
                <div className="font-mono text-xs text-muted-foreground">Level {level} • {stats.totalPoints} pts • {stats.gamesPlayed} games</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="text-xs font-mono text-muted-foreground/50 mt-1">Progress to Level {level + 1}</div>
          </div>
        )}

        {/* Difficulty selector */}
        <div className="mb-8">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Difficulty</div>
          <div className="flex gap-2 justify-center">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`flex-1 py-3 px-4 rounded-lg border font-mono text-sm transition-all ${
                  difficulty === d.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                <div className={`font-bold ${d.color}`}>{d.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                <div className="text-xs text-muted-foreground/50 mt-0.5">
                  {d.value === 'easy' ? '×1' : d.value === 'medium' ? '×1.5' : '×2.5'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onStart(difficulty)}
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
