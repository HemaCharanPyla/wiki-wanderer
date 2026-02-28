export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ScoreResult {
  points: number;
  timeBonus: number;
  moveBonus: number;
  difficultyMultiplier: number;
  coinsEarned: number;
}

export interface PlayerStats {
  totalPoints: number;
  gamesPlayed: number;
  level: number;
  rank: string;
  coins: number;
  tutorialComplete: boolean;
}

// 100 levels with escalating XP thresholds
// Level 1-10: 300 per level, 11-30: 500, 31-60: 800, 61-100: 1200
export function getPointsForLevel(level: number): number {
  if (level <= 10) return 300;
  if (level <= 30) return 500;
  if (level <= 60) return 800;
  return 1200;
}

export function getLevelFromPoints(totalPoints: number): number {
  let level = 1;
  let pointsNeeded = 0;
  while (level < 100 && pointsNeeded + getPointsForLevel(level) <= totalPoints) {
    pointsNeeded += getPointsForLevel(level);
    level++;
  }
  return level;
}

export function getProgressToNextLevel(totalPoints: number): number {
  let level = 1;
  let pointsSpent = 0;
  while (level < 100 && pointsSpent + getPointsForLevel(level) <= totalPoints) {
    pointsSpent += getPointsForLevel(level);
    level++;
  }
  if (level >= 100) return 1;
  const remaining = totalPoints - pointsSpent;
  const needed = getPointsForLevel(level);
  return Math.min(1, remaining / needed);
}

const RANKS = [
  { minLevel: 1, name: 'Wiki Newbie', icon: '🌱' },
  { minLevel: 3, name: 'Link Hopper', icon: '🐸' },
  { minLevel: 5, name: 'Path Finder', icon: '🧭' },
  { minLevel: 8, name: 'Wiki Walker', icon: '🚶' },
  { minLevel: 12, name: 'Maze Runner', icon: '🏃' },
  { minLevel: 16, name: 'Link Master', icon: '⚡' },
  { minLevel: 20, name: 'Wiki Sage', icon: '🧙' },
  { minLevel: 25, name: 'Path Legend', icon: '👑' },
  { minLevel: 35, name: 'Maze God', icon: '🌟' },
  { minLevel: 50, name: 'Wiki Overlord', icon: '🔱' },
  { minLevel: 70, name: 'Link Deity', icon: '💎' },
  { minLevel: 90, name: 'Wiki Immortal', icon: '🏆' },
  { minLevel: 100, name: 'The One', icon: '👁️' },
];

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
};

const COIN_REWARD: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

export const HINT_COST = 15;

export function calculateScore(moves: number, elapsedSeconds: number, difficulty: Difficulty): ScoreResult {
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const base = 100;
  const moveBonus = Math.max(0, Math.round(500 - (moves - 1) * 50));
  const timeBonus = Math.max(0, Math.round(400 - elapsedSeconds * 2));
  const points = Math.round((base + moveBonus + timeBonus) * difficultyMultiplier);
  const coinsEarned = COIN_REWARD[difficulty] + (moves <= 3 ? 5 : 0) + (elapsedSeconds <= 60 ? 5 : 0);

  return { points, timeBonus: Math.max(0, timeBonus), moveBonus: Math.max(0, moveBonus), difficultyMultiplier, coinsEarned };
}

export function getRank(level: number): { name: string; icon: string } {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  return rank;
}

export function loadPlayerStats(): PlayerStats {
  try {
    const data = localStorage.getItem('wikimaze-stats');
    if (data) {
      const parsed = JSON.parse(data);
      return { coins: 0, tutorialComplete: false, ...parsed };
    }
  } catch {}
  return { totalPoints: 0, gamesPlayed: 0, level: 1, rank: 'Wiki Newbie', coins: 0, tutorialComplete: false };
}

export function savePlayerStats(stats: PlayerStats): void {
  localStorage.setItem('wikimaze-stats', JSON.stringify(stats));
}
