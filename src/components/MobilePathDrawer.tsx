import { useState } from 'react';
import { ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobilePathDrawerProps {
  path: string[];
  targetTitle: string;
}

export function MobilePathDrawer({ path, targetTitle }: MobilePathDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Drawer panel */}
      {isOpen && (
        <div className="bg-card border-t border-border max-h-[50vh] flex flex-col animate-fade-in">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1">
              {path.map((title, i) => (
                <div key={`${title}-${i}`} className="flex items-start gap-2">
                  <div className="flex flex-col items-center mt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      i === 0 ? 'bg-primary glow-primary' :
                      i === path.length - 1 ? 'bg-accent glow-accent' :
                      'bg-muted-foreground/40'
                    }`} />
                    {i < path.length - 1 && (
                      <div className="w-px h-4 bg-border mt-0.5" />
                    )}
                  </div>
                  <span className={`text-xs font-mono leading-tight py-0.5 ${
                    i === path.length - 1 ? 'text-accent font-semibold' : 'text-muted-foreground'
                  }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center gap-2">
              <MapPin className="w-3 h-3 text-warning shrink-0" />
              <span className="font-mono text-xs text-muted-foreground">Target:</span>
              <span className="font-mono text-xs font-bold text-warning truncate">{targetTitle}</span>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-card border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        <span className="font-mono text-xs">
          Path ({path.length}) {!isOpen && `• Target: ${targetTitle}`}
        </span>
      </button>
    </div>
  );
}
