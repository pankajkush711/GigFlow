import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';

export const fetchBids = createAsyncThunk(
  'bids/fetchByGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bids/${gigId}`);
      return { gigId, bids: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bids');
    }
  },
);

export const createBid = createAsyncThunk(
  'bids/create',
  async ({ gigId, message, price }, { rejectWithValue }) => {
    try {
      const res = await api.post('/bids', { gigId, message, price });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create bid');
    }
  },
);

export const hireBid = createAsyncThunk(
  'bids/hire',
  async (bidId, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/bids/${bidId}/hire`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to hire freelancer');
    }
  },
);

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    byGig: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.loading = false;
        state.byGig[action.payload.gigId] = action.payload.bids;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        const bid = action.payload;
        const list = state.byGig[bid.gigId];
        if (list) list.unshift(bid);
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        const { gig, bid } = action.payload;
        const list = state.byGig[gig._id];
        if (!list) return;
        list.forEach((b) => {
          if (b._id === bid._id) {
            b.status = 'hired';
          } else if (b.status === 'pending') {
            b.status = 'rejected';
          }
        });
      });
  },
});

export default bidsSlice.reducer;

