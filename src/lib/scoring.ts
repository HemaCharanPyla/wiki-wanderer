export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ScoreResult {
  points: number;
  timeBonus: number;
  moveBonus: number;
  difficultyMultiplier: number;
}

export interface PlayerStats {
  totalPoints: number;
  gamesPlayed: number;
  level: number;
  rank: string;
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
  { minLevel: 30, name: 'Maze God', icon: '🌟' },
];

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
};

export function calculateScore(moves: number, elapsedSeconds: number, difficulty: Difficulty): ScoreResult {
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty];
  
  // Base points
  const base = 100;
  
  // Move bonus: fewer moves = more points (max 500)
  const moveBonus = Math.max(0, Math.round((500 - (moves - 1) * 50)));
  
  // Time bonus: faster = more points (max 400)
  const timeBonus = Math.max(0, Math.round((400 - elapsedSeconds * 2)));
  
  const points = Math.round((base + moveBonus + timeBonus) * difficultyMultiplier);
  
  return { points, timeBonus: Math.max(0, timeBonus), moveBonus: Math.max(0, moveBonus), difficultyMultiplier };
}

export function getPointsForLevel(level: number): number {
  // Each level requires progressively more points
  return level * 500;
}

export function getLevelFromPoints(totalPoints: number): number {
  let level = 1;
  let pointsNeeded = 0;
  while (pointsNeeded + getPointsForLevel(level) <= totalPoints) {
    pointsNeeded += getPointsForLevel(level);
    level++;
  }
  return level;
}

export function getProgressToNextLevel(totalPoints: number): number {
  let level = 1;
  let pointsSpent = 0;
  while (pointsSpent + getPointsForLevel(level) <= totalPoints) {
    pointsSpent += getPointsForLevel(level);
    level++;
  }
  const remaining = totalPoints - pointsSpent;
  const needed = getPointsForLevel(level);
  return Math.min(1, remaining / needed);
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
    if (data) return JSON.parse(data);
  } catch {}
  return { totalPoints: 0, gamesPlayed: 0, level: 1, rank: 'Wiki Newbie' };
}

export function savePlayerStats(stats: PlayerStats): void {
  localStorage.setItem('wikimaze-stats', JSON.stringify(stats));
}
