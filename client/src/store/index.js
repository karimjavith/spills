import { configureStore } from "@reduxjs/toolkit";
import roundedUpReducer from "./roundedUpSlice";
import accountReducer from "./accountSlice";

const store = configureStore({
  reducer: {
    account: accountReducer,
    roundedUp: roundedUpReducer,
  },
});

export default store;
