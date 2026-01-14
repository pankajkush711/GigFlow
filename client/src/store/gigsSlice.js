import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';

export const fetchGigs = createAsyncThunk(
  'gigs/fetchAll',
  async (search, { rejectWithValue }) => {
    try {
      const res = await api.get('/gigs', {
        params: search ? { search } : {},
      });
      return res.data;
    } catch (err) {
      return rejectWithValue('Failed to load gigs');
    }
  },
);

export const createGig = createAsyncThunk(
  'gigs/create',
  async ({ title, description, budget }, { rejectWithValue }) => {
    try {
      const res = await api.post('/gigs', { title, description, budget });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create gig');
    }
  },
);

const gigsSlice = createSlice({
  name: 'gigs',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default gigsSlice.reducer;

