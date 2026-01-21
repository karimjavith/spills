/**
 * Calculates the round-up amount needed to reach the next whole currency unit.
 * For example, if a transaction is £2.35, this returns 0.65 (the amount needed to round up to £3.00).
 *
 * @export
 * @param {number} minorUnits - The transaction amount in minor units (e.g., pence, cents)
 * @returns {number} The round-up amount in major units (e.g., pounds, dollars). Returns 0 if the amount is already a whole number.
 * @example
 * calculateRoundUp(235) // returns 0.65 (rounds £2.35 to £3.00)
 * calculateRoundUp(300) // returns 0 (already a whole number)
 * calculateRoundUp(199) // returns 0.01 (rounds £1.99 to £2.00)
 */
export function calculateRoundUp(minorUnits) {
  const amount = minorUnits / 100;
  const rounded = Math.ceil(amount);
  return Math.max(0, rounded - amount);
}
