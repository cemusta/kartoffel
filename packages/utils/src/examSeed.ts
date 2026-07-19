const SEED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SEED_LENGTH = 5;

export function generateSeed(): string {
  let result = '';
  for (let i = 0; i < SEED_LENGTH; i++) {
    result += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)];
  }
  return result;
}

export function seedToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// mulberry32 — deterministic PRNG seeded by a 32-bit integer
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  const rand = mulberry32(seedToNumber(seed));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
