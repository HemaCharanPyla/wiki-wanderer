import { useCallback, useRef, useEffect } from 'react';
import { extractTitleFromHref, normalizeTitle, type WikiPage } from '@/lib/wikipedia';
import { Loader2 } from 'lucide-react';

interface WikiViewerProps {
  page: WikiPage | null;
  onNavigate: (title: string) => void;
  isNavigating: boolean;
  hintActive?: boolean;
  targetTitle?: string;
}

export function WikiViewer({ page, onNavigate, isNavigating, hintActive, targetTitle }: WikiViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    e.preventDefault();
    e.stopPropagation();
    const href = anchor.getAttribute('href');
    if (!href) return;
    const title = extractTitleFromHref(href);
    if (title && !title.includes(':') && !title.startsWith('#')) {
      onNavigate(title);
    }
  }, [onNavigate]);

  // Highlight hint links that match the target
  useEffect(() => {
    if (!contentRef.current || !hintActive || !targetTitle) return;
    const normalizedTarget = normalizeTitle(targetTitle).toLowerCase();
    const links = contentRef.current.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const title = extractTitleFromHref(href);
      if (title && normalizeTitle(title).toLowerCase() === normalizedTarget) {
        (link as HTMLElement).classList.add('hint-highlight');
      }
    });
    return () => {
      links.forEach(link => (link as HTMLElement).classList.remove('hint-highlight'));
    };
  }, [hintActive, targetTitle, page]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
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
      <div ref={contentRef} className="h-full overflow-y-auto px-4 sm:px-8 py-6">
        <h1 className="font-mono text-2xl sm:text-3xl font-bold text-foreground mb-6 pb-3 border-b border-border">
          {page.title}
        </h1>
        <div
          className="wiki-content max-w-3xl text-sm sm:text-base leading-relaxed"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>
      <div className="scanline absolute inset-0 pointer-events-none" />
    </div>
  );
}
