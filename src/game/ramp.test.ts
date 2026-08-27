import { describe, it, expect } from 'vitest';
import { planForProgress, tierForCorrect } from './ramp';
import { presetById } from './presets';
import { CONFIG } from './config';

const strong = presetById('strong');
const weak = presetById('weak');
const mixed = presetById('mixed');
const all = presetById('all');
const N = CONFIG.TIER_ADVANCE_EVERY;

describe('tierForCorrect', () => {
  it('advances one tier every TIER_ADVANCE_EVERY correct', () => {
    expect(tierForCorrect(0)).toBe(1);
    expect(tierForCorrect(N - 1)).toBe(1);
    expect(tierForCorrect(N)).toBe(2);
    expect(tierForCorrect(N * 2)).toBe(3);
  });
});

describe('planForProgress — grammar scope', () => {
  it('every mode is fully exhaustive for its category from round one (no case-order gating)', () => {
    for (const correct of [0, 1, N, N * 4, 999]) {
      for (const p of [strong, weak, all]) {
        const c = planForProgress(p, correct).constraints;
        expect(c.cueMode).toBe('context');
        expect(c.cases).toEqual(expect.arrayContaining(['nom', 'acc', 'dat', 'gen']));
        expect(c.numbers).toEqual(expect.arrayContaining(['sg', 'pl']));
      }
      const mc = planForProgress(mixed, correct).constraints;
      expect(mc.cases).toEqual(expect.arrayContaining(['nom', 'acc', 'dat', 'gen']));
      expect(mc.numbers).toEqual(['sg']); // indefinite + plural unsupported
    }
  });

  it('Strong is fixed to no-article throughout', () => {
    for (const correct of [0, N, N * 4, 999]) {
      expect(planForProgress(strong, correct).constraints.articleTypes).toEqual(['none']);
    }
  });

  it('Weak is fixed to the definite article throughout', () => {
    for (const correct of [0, N, N * 4, 999]) {
      expect(planForProgress(weak, correct).constraints.articleTypes).toEqual(['definite']);
    }
  });

  it('Mixed is fixed to the indefinite article throughout', () => {
    for (const correct of [0, N, N * 3, 999]) {
      expect(planForProgress(mixed, correct).constraints.articleTypes).toEqual(['indefinite']);
    }
  });

  it('All categories draws from every article type throughout, not just at the top', () => {
    for (const correct of [0, N, 999]) {
      const c = planForProgress(all, correct).constraints;
      expect(c.articleTypes).toEqual(
        expect.arrayContaining(['definite', 'indefinite', 'none']),
      );
    }
  });
});

describe('planForProgress — sawtooth clock', () => {
  it('tier 1 first round is the full base clock', () => {
    expect(planForProgress(strong, 0).clockMs).toBe(strong.baseClockMs);
  });

  it('shrinks within a tier', () => {
    const r0 = planForProgress(strong, 0).clockMs;
    const r1 = planForProgress(strong, 1).clockMs;
    const r2 = planForProgress(strong, 2).clockMs;
    expect(r1).toBeLessThan(r0);
    expect(r2).toBeLessThan(r1);
  });

  it('resets UP on tier-up (relief), to 95% of the previous tier start', () => {
    const tier1End = planForProgress(strong, N - 1).clockMs;
    const tier2Start = planForProgress(strong, N).clockMs;
    expect(tier2Start).toBeGreaterThan(tier1End);
    expect(tier2Start).toBe(
      Math.round(strong.baseClockMs * CONFIG.TIER_RESET_FACTOR),
    );
  });

  it('each tier start is ~5% below the previous tier start', () => {
    const s1 = planForProgress(strong, 0).clockMs;
    const s2 = planForProgress(strong, N).clockMs;
    const s3 = planForProgress(strong, 2 * N).clockMs;
    expect(s2 / s1).toBeCloseTo(CONFIG.TIER_RESET_FACTOR, 2);
    expect(s3 / s2).toBeCloseTo(CONFIG.TIER_RESET_FACTOR, 2);
  });

  it('never drops below the floor', () => {
    expect(planForProgress(strong, 9999).clockMs).toBe(CONFIG.CLOCK_FLOOR_MS);
  });

  it('all four presets share the same standard base clock', () => {
    expect(weak.baseClockMs).toBe(strong.baseClockMs);
    expect(mixed.baseClockMs).toBe(strong.baseClockMs);
    expect(all.baseClockMs).toBe(strong.baseClockMs);
  });
});