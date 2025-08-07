
import { useAppDispatch, useAppSelector } from '../store';
import { setUser, logout, setLoading } from '../store/authSlice';
import { api } from '../services/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  const login = async (username: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const response = await api.login(username, password);
      
      // Assuming your backend returns user info or we need to fetch it
      // For now, we'll create a simple user object
      dispatch(setUser({ _id: '1', username }));
      
      return { success: true };
    } catch (error) {
      dispatch(setLoading(false));
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      dispatch(setLoading(true));
      await api.signup(username, password);
      dispatch(setLoading(false));
      return { success: true };
    } catch (error) {
      dispatch(setLoading(false));
      return { success: false, error: 'Signup failed' };
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      dispatch(logout());
    } catch (error) {
      dispatch(logout()); // Logout anyway
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout: handleLogout,
  };
};


