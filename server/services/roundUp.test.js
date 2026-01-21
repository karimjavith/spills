import { describe, it, expect } from 'vitest';
import { calculateRoundUp } from './roundUp.js';

describe('calculateRoundUp', () => {
  it('should round up to the nearest pound', () => {
    expect(calculateRoundUp(435)).toBeCloseTo(0.65); // £4.35 -> £5.00
    expect(calculateRoundUp(520)).toBeCloseTo(0.8); // £5.20 -> £6.00
    expect(calculateRoundUp(87)).toBeCloseTo(0.13); // £0.87 -> £1.00
    expect(calculateRoundUp(100)).toBeCloseTo(0.0); // £1.00 -> £1.00
  });
});
