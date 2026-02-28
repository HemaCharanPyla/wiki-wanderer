import { useState } from 'react';
import { GraduationCap, MousePointerClick, Target, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialOverlayProps {
  step: number;
  targetTitle: string;
  onDismiss: () => void;
}

const STEPS = [
  {
    icon: GraduationCap,
    title: 'Welcome to WikiMaze!',
    text: 'Your goal is to navigate from the current Wikipedia article to the target article using only the links on each page.',
  },
  {
    icon: MousePointerClick,
    title: 'Click the Green Links',
    text: 'Click any green-highlighted link to navigate to that article. Each click counts as a move.',
  },
  {
    icon: Target,
    title: 'Find the Target!',
    text: 'Look for links that might lead you closer to your target article. Fewer moves = more points!',
  },
];

export function TutorialOverlay({ step, targetTitle, onDismiss }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const s = STEPS[currentStep];
  const Icon = s.icon;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 animate-scale-in">
      <div className="bg-card border border-accent/30 rounded-xl p-5 glow-accent shadow-2xl">
        <button onClick={onDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-foreground">{s.title}</div>
            <div className="text-xs font-mono text-muted-foreground">Step {currentStep + 1}/{STEPS.length}</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{s.text}</p>

        {currentStep === 2 && (
          <div className="flex items-center gap-2 bg-accent/10 rounded-lg px-3 py-2 mb-3">
            <Target className="w-4 h-4 text-accent shrink-0" />
            <span className="font-mono text-sm font-bold text-accent">{targetTitle}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= currentStep ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
          {currentStep < STEPS.length - 1 ? (
            <Button size="sm" variant="ghost" onClick={() => setCurrentStep(c => c + 1)} className="font-mono text-xs text-accent">
              Next <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={onDismiss} className="font-mono text-xs text-accent">
              Got it!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
