import { useCallback, useRef, useEffect, useState } from 'react';
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
  const [transitioning, setTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState<WikiPage | null>(page);

  // Smooth page transition
  useEffect(() => {
    if (!page) {
      setDisplayPage(null);
      return;
    }
    if (displayPage?.title !== page.title) {
      setTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayPage(page);
        setTransitioning(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [page]);

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
  }, [hintActive, targetTitle, displayPage]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [displayPage?.title]);

  if (!displayPage) {
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
        className={`h-full overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 transition-all duration-200 ${
          transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <h1 className="font-mono text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-border">
          {displayPage.title}
        </h1>
        <div
          className="wiki-content max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: displayPage.html }}
        />
      </div>
      <div className="scanline absolute inset-0 pointer-events-none" />
    </div>
  );
}
