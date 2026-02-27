import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight } from 'lucide-react';

interface PathSidebarProps {
  path: string[];
  targetTitle: string;
}

export function PathSidebar({ path, targetTitle }: PathSidebarProps) {
  return (
    <aside className="w-64 border-l border-border bg-card/50 hidden lg:flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Path History
        </h2>
        <p className="font-mono text-sm text-foreground mt-1">
          {path.length} {path.length === 1 ? 'page' : 'pages'}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {path.map((title, i) => (
            <div
              key={`${title}-${i}`}
              className="flex items-start gap-2 animate-slide-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
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
      </ScrollArea>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs">
          <ChevronRight className="w-3 h-3 text-warning" />
          <span className="font-mono text-muted-foreground">Target:</span>
        </div>
        <span className="font-mono text-sm font-bold text-warning mt-1 block truncate">
          {targetTitle}
        </span>
      </div>
    </aside>
  );
}
