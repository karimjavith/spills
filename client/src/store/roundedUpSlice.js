
import { createSlice } from '@reduxjs/toolkit';

/**
 * To manage the list of transaction IDs that have been rounded up.
 * The state is persisted in localStorage to maintain across sessions.
 *
 * @type {import('@reduxjs/toolkit').Slice}
 */
const roundedUpSlice = createSlice({
  name: 'roundedUp',
  initialState: {
    roundedUpTxIds: (() => {
      try {
        return JSON.parse(localStorage.getItem('roundedUpTxIds') || '[]');
      } catch {
        return [];
      }
    })(),
  },
  reducers: {
    markRoundedUp(state, action) {
      // action.payload: array of txIds to add
      const newIds = Array.from(new Set([...state.roundedUpTxIds, ...action.payload]));
      state.roundedUpTxIds = newIds;
      localStorage.setItem('roundedUpTxIds', JSON.stringify(newIds));
    },
    resetRoundedUp(state) {
      state.roundedUpTxIds = [];
      localStorage.removeItem('roundedUpTxIds');
    },
  }
});

export const { markRoundedUp, resetRoundedUp } = roundedUpSlice.actions;
export default roundedUpSlice.reducer;