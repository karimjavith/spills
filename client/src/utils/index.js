/**
 * Calculates the start (Monday) and end (Sunday) of the week for a given date.
 *
 * @param {Date|string} date - The input date to calculate the week range for
 * @returns {{ startOfWeek: Date; endOfWeek: Date; }} Object containing the start and end dates of the week
 */
export function getWeekRange(date) {
  const currentSelectedDate = new Date(date);
  const dayOfWeek = currentSelectedDate.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Find the day of the week and find the number of days to subtract to get Monday
  const setMonday = new Date(currentSelectedDate);
  setMonday.setDate(currentSelectedDate.getDate() + diffToMonday); // set the start to Monday, by getting the current date and adding the diff

  const setSunday = new Date(setMonday);
  setSunday.setDate(setMonday.getDate() + 6);
  return {
    startOfWeek: setMonday.toISOString().slice(0, 10),
    endOfWeek: setSunday.toISOString().slice(0, 10),
  };
}

/**
 * Calculates the amount needed to round up a transaction to the next whole currency unit.
 * For example, a transaction of £1.23 would round up by £0.77 to £2.00.
 *
 * @param {number} amount - The transaction amount in minor units (e.g., pence for GBP)
 * @returns {number} The round-up amount in major units
 */
export function roundUp(amount) {
  const val = Math.abs(amount / 100);
  const rounded = Math.ceil(val) - val;
  return rounded === 1 ? 0 : rounded;
}
