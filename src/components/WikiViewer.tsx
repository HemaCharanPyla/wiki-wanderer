import { useCallback, useRef, useEffect } from 'react';
import { extractTitleFromHref, type WikiPage } from '@/lib/wikipedia';
import { Loader2 } from 'lucide-react';

interface WikiViewerProps {
  page: WikiPage | null;
  onNavigate: (title: string) => void;
  isNavigating: boolean;
}

export function WikiViewer({ page, onNavigate, isNavigating }: WikiViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (!anchor) return;
    e.preventDefault();
    
    const href = anchor.getAttribute('href');
    if (!href) return;

    const title = extractTitleFromHref(href);
    if (title && !title.includes(':') && !title.startsWith('#')) {
      onNavigate(title);
    }
  }, [onNavigate]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [page?.title]);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {isNavigating && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      
      <div
        ref={contentRef}
        className="h-full overflow-y-auto px-4 sm:px-8 py-6"
      >
        <h1 className="font-mono text-2xl sm:text-3xl font-bold text-foreground mb-6 pb-3 border-b border-border">
          {page.title}
        </h1>
        <div
          className="wiki-content max-w-3xl text-sm sm:text-base leading-relaxed"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>
      
      {/* Scanline overlay */}
      <div className="scanline absolute inset-0 pointer-events-none" />
    </div>
  );
}
