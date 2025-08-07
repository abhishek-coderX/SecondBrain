
import { createSlice } from '@reduxjs/toolkit';
import type {PayloadAction} from "@reduxjs/toolkit"
import type { Content } from '../types';

interface ContentState {
  items: Content[];
  isLoading: boolean;
}

const initialState: ContentState = {
  items: [],
  isLoading: false,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<Content[]>) => {
      state.items = action.payload;
    },
    addContent: (state, action: PayloadAction<Content>) => {
      state.items.unshift(action.payload);
    },
    removeContent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setContent, addContent, removeContent, setLoading } = contentSlice.actions;
export default contentSlice.reducer;
