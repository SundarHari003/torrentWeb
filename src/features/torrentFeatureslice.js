import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// Thunks for API requests

// Fetch all torrents
export const fetchTorrents = createAsyncThunk('torrents/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/torrents');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch torrents');
  }
});

// Add torrent via Magnet URI
export const addTorrent = createAsyncThunk('torrents/add', async (magnetURI, { rejectWithValue }) => {
  try {
    const response = await api.post('/torrents', { magnetURI });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to add torrent');
  }
});

// Remove torrent
export const removeTorrent = createAsyncThunk('torrents/remove', async (infoHash, { rejectWithValue }) => {
  try {
    await api.delete(`/torrents/${infoHash}`);
    return infoHash;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to remove torrent');
  }
});

// Initial State
const initialState = {
  torrents: [],
  loading: false,
  error: null,
};

// Torrent Slice
const torrentSlice = createSlice({
  name: 'torrents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addTorrent.fulfilled, (state,action) => {
        state.torrents= action.payload;
      })
      .addCase(removeTorrent.fulfilled, (state, { payload }) => {
        state.torrents = state.torrents.filter((torrent) => torrent.infoHash !== payload);
      });
  },
});

export default torrentSlice.reducer;
