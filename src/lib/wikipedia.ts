// Wikipedia API service layer
import DOMPurify from 'dompurify';

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_ACTION_API = 'https://en.wikipedia.org/w/api.php';

export interface WikiPage {
  title: string;
  html: string;
  extract?: string;
}

import type { Difficulty } from '@/lib/scoring';

// Categorized articles for difficulty-based pairing
const ARTICLE_CATEGORIES: Record<string, string[]> = {
  science: ['Albert_Einstein', 'DNA', 'Solar_System', 'Gravity', 'Electricity', 'Vaccine', 'Artificial_intelligence', 'Climate_change', 'Coral_reef', 'Volcano'],
  history: ['World_War_II', 'Napoleon', 'Ancient_Egypt', 'Renaissance', 'Rome', 'Democracy', 'Olympic_Games', 'Leonardo_da_Vinci', 'Shakespeare', 'Nikola_Tesla'],
  geography: ['United_States', 'Japan', 'Africa', 'Antarctica', 'Sahara', 'Mount_Everest', 'Amazon_rainforest', 'Ocean', 'Mars', 'Moon'],
  culture: ['Football', 'Basketball', 'Chess', 'Music', 'Hip_hop', 'Guitar', 'Photography', 'Television', 'Yoga', 'Pizza'],
  technology: ['Internet', 'Smartphone', 'Robot', 'Python_(programming_language)', 'Artificial_intelligence', 'Television', 'Electricity', 'DNA', 'Vaccine', 'Photography'],
  nature: ['Cat', 'Dog', 'Butterfly', 'Dinosaur', 'Coral_reef', 'Amazon_rainforest', 'Volcano', 'Ocean', 'Coffee', 'Chocolate'],
};

const ALL_CATEGORIES = Object.keys(ARTICLE_CATEGORIES);

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function getRandomArticles(count: number = 2, difficulty: Difficulty = 'medium'): Promise<string[]> {
  if (difficulty === 'easy') {
    // Same category → closely related
    const cat = pickRandom(ALL_CATEGORIES);
    const pool = [...ARTICLE_CATEGORIES[cat]].sort(() => Math.random() - 0.5);
    return [pool[0], pool[1]];
  } else if (difficulty === 'medium') {
    // Adjacent categories
    const idx = Math.floor(Math.random() * ALL_CATEGORIES.length);
    const cat1 = ALL_CATEGORIES[idx];
    const cat2 = ALL_CATEGORIES[(idx + 1) % ALL_CATEGORIES.length];
    const a = pickRandom(ARTICLE_CATEGORIES[cat1]);
    let b = pickRandom(ARTICLE_CATEGORIES[cat2]);
    while (b === a) b = pickRandom(ARTICLE_CATEGORIES[cat2]);
    return [a, b];
  } else {
    // Hard: completely unrelated categories
    const cats = [...ALL_CATEGORIES].sort(() => Math.random() - 0.5);
    const a = pickRandom(ARTICLE_CATEGORIES[cats[0]]);
    const b = pickRandom(ARTICLE_CATEGORIES[cats[cats.length - 1]]);
    return [a, b];
  }
}

export async function fetchPageHtml(title: string): Promise<WikiPage> {
  const encodedTitle = encodeURIComponent(title);
  const response = await fetch(`${WIKI_API}/page/html/${encodedTitle}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${title}`);
  }

  const rawHtml = await response.text();
  
  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'a', 'b', 'i', 'em', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'span', 'div',
      'br', 'hr', 'img', 'figcaption', 'figure', 'blockquote', 'sup', 'sub', 'dl', 'dt', 'dd', 'section'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'title', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });

  const displayTitle = title.replace(/_/g, ' ');

  return {
    title: displayTitle,
    html: clean,
  };
}

export function extractTitleFromHref(href: string): string | null {
  // Match ./Article_Name (Wikipedia REST API format)
  let match = href.match(/^\.\/([^#]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  // Match /wiki/Article_Name
  match = href.match(/^\/wiki\/([^#]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  // Match full Wikipedia URLs
  match = href.match(/en\.wikipedia\.org\/wiki\/([^#]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export function formatTitle(title: string): string {
  return title.replace(/_/g, ' ');
}

export function normalizeTitle(title: string): string {
  return title.replace(/ /g, '_');
}
