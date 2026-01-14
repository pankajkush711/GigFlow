import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/authSlice';
import gigsReducer from './store/gigsSlice';
import bidsReducer from './store/bidsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
    bids: bidsReducer,
  },
});

