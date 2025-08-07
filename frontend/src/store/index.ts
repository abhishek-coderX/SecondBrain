export interface User {
  _id: string;
  username: string;
}

export interface Content {
  _id: string;
  title: string;
  link: string;
  type: 'image' | 'video' | 'article' | 'audio';
  tags: string[];
  createdAt: string;
}

// ====================
// 2. STORE SETUP
// ====================

// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authSlice from './authSlice';
import contentSlice from './contentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    content: contentSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = (selector: (state: RootState) => any) => useSelector(selector);
