import { describe, it, expect } from 'vitest';
import { generateUsername } from './generateUsername';

describe('generateUsername', () => {
  it('returns a non-empty string', () => {
    expect(generateUsername()).toBeTruthy();
  });

  it('matches format: AdjectiveNoun + 2-digit number', () => {
    const username = generateUsername();
    expect(username).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
  });

  it('ends with number between 10 and 99', () => {
    const username = generateUsername();
    const num = parseInt(username.replace(/\D/g, ''), 10);
    expect(num).toBeGreaterThanOrEqual(10);
    expect(num).toBeLessThanOrEqual(99);
  });

  it('produces different values across calls', () => {
    const results = new Set(Array.from({ length: 50 }, () => generateUsername()));
    expect(results.size).toBeGreaterThan(1);
  });
});
