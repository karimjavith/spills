import { createSlice } from '@reduxjs/toolkit';

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