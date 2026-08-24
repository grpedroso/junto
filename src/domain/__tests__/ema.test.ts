import {
  EMAS_FOR_CARE_SCREEN,
  evaluateTrigger,
  needsCareScreen,
  THRESHOLD,
  withJitter,
} from '../ema';
import type { Mood } from '../types';

describe('evaluateTrigger', () => {
  it('fires at the exact craving threshold', () => {
    expect(evaluateTrigger({ craving: 7, selfEfficacy: 10 })).toEqual({
      fires: true,
      reason: 'high_craving',
    });
  });

  it('does not fire one point below high craving with good self-efficacy', () => {
    expect(evaluateTrigger({ craving: 6, selfEfficacy: 6 })).toEqual({
      fires: false,
      reason: null,
    });
  });

  it('fires at the exact self-efficacy threshold', () => {
    expect(evaluateTrigger({ craving: 0, selfEfficacy: 3 })).toEqual({
      fires: true,
      reason: 'low_self_efficacy',
    });
  });

  it('does not fire one point above low self-efficacy with low craving', () => {
    expect(evaluateTrigger({ craving: 4, selfEfficacy: 4 }).fires).toBe(false);
  });

  it('fires on the combination of two middling values', () => {
    expect(evaluateTrigger({ craving: 5, selfEfficacy: 5 })).toEqual({
      fires: true,
      reason: 'combined',
    });
  });

  it('records the most specific reason when several conditions hold', () => {
    expect(evaluateTrigger({ craving: 9, selfEfficacy: 1 }).reason).toBe('high_craving');
    expect(evaluateTrigger({ craving: 6, selfEfficacy: 2 }).reason).toBe('low_self_efficacy');
  });

  it('does not fire on the calm case', () => {
    expect(evaluateTrigger({ craving: 0, selfEfficacy: 10 }).fires).toBe(false);
  });

  it.each([
    [-1, 5],
    [11, 5],
    [5, -1],
    [5, 11],
    [5.5, 5],
  ])('rejects values outside the scale (%p, %p)', (craving, selfEfficacy) => {
    expect(() => evaluateTrigger({ craving, selfEfficacy })).toThrow(/scale/);
  });

  it('covers the whole grid with no gap in the rule', () => {
    for (let c = 0; c <= 10; c++) {
      for (let s = 0; s <= 10; s++) {
        const expected =
          c >= THRESHOLD.highCraving ||
          s <= THRESHOLD.lowSelfEfficacy ||
          (c >= THRESHOLD.mediumCraving && s <= THRESHOLD.mediumSelfEfficacy);
        expect(evaluateTrigger({ craving: c, selfEfficacy: s }).fires).toBe(expected);
      }
    }
  });
});

describe('withJitter', () => {
  it('does not shift at the middle of the draw', () => {
    expect(withJitter({ hour: 11, minute: 0 }, 30, () => 0.5)).toEqual({ hour: 11, minute: 0 });
  });

  it('shifts up to half an hour either way', () => {
    expect(withJitter({ hour: 17, minute: 0 }, 30, () => 0)).toEqual({ hour: 16, minute: 30 });
    expect(withJitter({ hour: 17, minute: 0 }, 30, () => 1)).toEqual({ hour: 17, minute: 30 });
  });

  it('wraps around midnight without overflowing the hour', () => {
    expect(withJitter({ hour: 0, minute: 10 }, 30, () => 0)).toEqual({ hour: 23, minute: 40 });
    expect(withJitter({ hour: 23, minute: 50 }, 30, () => 1)).toEqual({ hour: 0, minute: 20 });
  });

  it('stays inside the window across a thousand draws', () => {
    for (let i = 0; i < 1000; i++) {
      const { hour, minute } = withJitter({ hour: 21, minute: 0 });
      const minutes = hour * 60 + minute;
      expect(minutes).toBeGreaterThanOrEqual(21 * 60 - 30);
      expect(minutes).toBeLessThanOrEqual(21 * 60 + 30);
    }
  });
});

describe('needsCareScreen', () => {
  const heavy = (mood: Mood = 'sad') => ({ craving: 8, mood });
  const light = { craving: 2, mood: 'calm' as Mood };

  it('does not offer before there are enough EMAs', () => {
    expect(needsCareScreen([heavy(), heavy()])).toBe(false);
  });

  it('offers after three heavy ones in a row', () => {
    expect(needsCareScreen([heavy(), heavy('irritated'), heavy()])).toBe(true);
  });

  it('does not offer if one of the three most recent was not heavy', () => {
    expect(needsCareScreen([heavy(), light, heavy(), heavy()])).toBe(false);
  });

  it('looks only at the most recent ones, not the whole history', () => {
    const history = [heavy(), heavy(), heavy(), light, light];
    expect(needsCareScreen(history, EMAS_FOR_CARE_SCREEN)).toBe(true);
  });

  it('negative mood with low craving is not enough', () => {
    const onlySad = { craving: 3, mood: 'sad' as Mood };
    expect(needsCareScreen([onlySad, onlySad, onlySad])).toBe(false);
  });

  it('high craving with good mood is not enough', () => {
    const onlyCraving = { craving: 9, mood: 'upbeat' as Mood };
    expect(needsCareScreen([onlyCraving, onlyCraving, onlyCraving])).toBe(false);
  });
});
