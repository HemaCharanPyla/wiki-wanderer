// Wikipedia API service layer
import DOMPurify from 'dompurify';

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_ACTION_API = 'https://en.wikipedia.org/w/api.php';

export interface WikiPage {
  title: string;
  html: string;
  extract?: string;
}

// List of good starting articles (popular, well-linked)
const POPULAR_ARTICLES = [
  'Albert_Einstein', 'United_States', 'World_War_II', 'Moon', 'Football',
  'Leonardo_da_Vinci', 'Solar_System', 'Olympic_Games', 'DNA', 'Shakespeare',
  'Internet', 'Pizza', 'Music', 'Japan', 'Amazon_rainforest',
  'Mars', 'Cat', 'Dog', 'Chess', 'Python_(programming_language)',
  'Napoleon', 'Rome', 'Dinosaur', 'Africa', 'Electricity',
  'Ocean', 'Mount_Everest', 'Coffee', 'Chocolate', 'Basketball',
  'Ancient_Egypt', 'Volcano', 'Photography', 'Artificial_intelligence', 'Guitar',
  'Democracy', 'Butterfly', 'Climate_change', 'Smartphone', 'Yoga',
  'Antarctica', 'Renaissance', 'Gravity', 'Coral_reef', 'Hip_hop',
  'Television', 'Robot', 'Vaccine', 'Nikola_Tesla', 'Sahara',
];

export async function fetchPageHtml(title: string): Promise<WikiPage> {
  const encodedTitle = encodeURIComponent(title);
  const response = await fetch(`${WIKI_API}/page/html/${encodedTitle}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${title}`);
  }

  const rawHtml = await response.text();
  
  // Sanitize HTML
  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'a', 'b', 'i', 'em', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'span', 'div',
      'br', 'hr', 'img', 'figcaption', 'figure', 'blockquote', 'sup', 'sub', 'dl', 'dt', 'dd', 'section'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'title', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });

  // Clean the title for display
  const displayTitle = title.replace(/_/g, ' ');

  return {
    title: displayTitle,
    html: clean,
  };
}

export async function getRandomArticles(count: number = 2): Promise<string[]> {
  // Pick from curated list for better game experience
  const shuffled = [...POPULAR_ARTICLES].sort(() => Math.random() - 0.5);
  const selected: string[] = [];
  
  for (let i = 0; i < Math.min(count * 2, shuffled.length) && selected.length < count; i++) {
    if (!selected.includes(shuffled[i])) {
      selected.push(shuffled[i]);
    }
  }
  
  return selected;
}

export function extractTitleFromHref(href: string): string | null {
  // Match internal wiki links like /wiki/Article_Name
  const match = href.match(/^\.\/([^#]+)/);
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
