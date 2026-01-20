
import { createSlice } from '@reduxjs/toolkit';

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