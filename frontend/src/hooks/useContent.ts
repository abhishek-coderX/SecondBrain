

import { useAppDispatch, useAppSelector } from '../store';
import { setContent, addContent, removeContent, setLoading } from '../store/contentSlice';
import { api } from '../services/api';

export const useContent = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector(state => state.content);

  const fetchContent = async () => {
    try {
      dispatch(setLoading(true));
      const content = await api.getContent();
      dispatch(setContent(content));
    } catch (error) {
      console.error('Failed to fetch content');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createContent = async (data: { title: string; link: string; type: string; tags?: string[] }) => {
    try {
      const newContent = await api.createContent(data);
      // You might need to adjust this based on your backend response
      dispatch(addContent({
        _id: Date.now().toString(), // Temporary ID
        ...data,
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create content' };
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await api.deleteContent(id);
      dispatch(removeContent(id));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete content' };
    }
  };

  return {
    items,
    isLoading,
    fetchContent,
    createContent,
    deleteContent,
  };
};