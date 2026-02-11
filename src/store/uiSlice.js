import { createSlice } from '@reduxjs/toolkit';

const createPageState = () => ({
  status: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
});

const initialState = {
  search: createPageState(),
  collections: createPageState(),
  collectionDetail: createPageState(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPageStatus(state, action) {
      const { page, status, error = null } = action.payload;
      if (!state[page]) return;
      state[page].status = status;
      state[page].error = status === 'failed' ? (error || 'Algo deu errado.') : null;
    },
    resetPage(state, action) {
      const page = action.payload;
      if (!state[page]) return;
      state[page].status = 'idle';
      state[page].error = null;
    },
  },
});

export const { setPageStatus, resetPage } = uiSlice.actions;
export default uiSlice.reducer;

