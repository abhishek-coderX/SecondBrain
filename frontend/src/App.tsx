
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LandingPage } from './pages/LandingPage';
import LoginSignup from './pages/Login';
import Layout from './pages/Layout';
import type { RootState } from './store/store';
import { useEffect, useState } from 'react';
import { setUser } from './store/authSlice';
import axios from 'axios';



import SharePage from './pages/SharePage';

const App = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch=useDispatch()
  const [isAuthChecking, setIsAuthChecking] = useState(true); 

  useEffect(()=>{
     const checkAuthStatus=async()=>
     {
           try {
            const res=await axios.get("http://localhost:4000/profile",{withCredentials:true})
            dispatch(setUser(res.data))
           } catch (error) {
            console.log(error);
           }
           finally {
        setIsAuthChecking(false);
      }
     }
     checkAuthStatus();

  },[dispatch])

 if (isAuthChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/home" /> : <LoginSignup />} 
      />

      <Route 
        path="/home" 
        element={user ? <Layout/> : <Navigate to="/auth" />} 
      />

      <Route path="/share/:shareId" element={<SharePage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;