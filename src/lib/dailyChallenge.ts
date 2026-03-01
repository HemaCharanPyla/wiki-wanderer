import { supabase } from '@/integrations/supabase/client';
import { ARTICLE_CATEGORIES } from '@/lib/wikipedia';

// Deterministic daily challenge based on date
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function getDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function generateDailyPair(): { start: string; target: string } {
  const rng = seededRandom(getDateSeed());
  const cats = Object.keys(ARTICLE_CATEGORIES);
  const cat1Idx = Math.floor(rng() * cats.length);
  const cat2Idx = Math.floor(rng() * cats.length);
  const pool1 = ARTICLE_CATEGORIES[cats[cat1Idx]];
  const pool2 = ARTICLE_CATEGORIES[cats[cat2Idx === cat1Idx ? (cat2Idx + 1) % cats.length : cat2Idx]];
  const start = pool1[Math.floor(rng() * pool1.length)];
  const target = pool2[Math.floor(rng() * pool2.length)];
  return { start, target };
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getDailyChallenge() {
  const today = getTodayDateString();

  // Try to fetch from DB
  const { data } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', today)
    .maybeSingle();

  if (data) {
    return { start: data.start_title, target: data.target_title, difficulty: data.difficulty as 'medium' };
  }

  // Generate deterministically and try to insert
  const pair = generateDailyPair();
  await supabase.from('daily_challenges').insert({
    challenge_date: today,
    start_title: pair.start,
    target_title: pair.target,
    difficulty: 'medium',
  });

  return { start: pair.start, target: pair.target, difficulty: 'medium' as const };
}

export async function hasCompletedDailyChallenge(userId: string): Promise<boolean> {
  const today = getTodayDateString();
  const { data } = await supabase
    .from('game_history')
    .select('id')
    .eq('user_id', userId)
    .eq('is_daily_challenge', true)
    .gte('created_at', today + 'T00:00:00')
    .limit(1);
  return !!(data && data.length > 0);
}
