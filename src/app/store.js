import { configureStore } from '@reduxjs/toolkit';
import torrentReducer from '../features/torrentFeatureslice';

export const store = configureStore({
  reducer: {
    torrents: torrentReducer,
  },
});
