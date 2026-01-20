import { createSlice } from '@reduxjs/toolkit';

/**
 * To manage the currently selected account information.
 * The account data is persisted in localStorage to maintain selection across sessions.
 *
 * @type {import('@reduxjs/toolkit').Slice}
 */
const accountSlice = createSlice({
  name: 'account',
  initialState: {
    account: (() => {
      try {
        return JSON.parse(localStorage.getItem('accountInfo') || 'null');
      } catch {
        return null;
      }
    })(), 
  },
  reducers: {
    setAccount(state, action) {
      state.account = action.payload;
      localStorage.setItem('accountInfo', JSON.stringify(action.payload));
    },
    resetAccount(state) {
      state.account = null;
      localStorage.removeItem('accountInfo');
    }
  },
});

export const { setAccount, resetAccount } = accountSlice.actions;
export default accountSlice.reducer;