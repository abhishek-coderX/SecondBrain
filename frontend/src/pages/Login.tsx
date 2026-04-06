import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/icons/Logo';

const LoginSignup = () => {
  const [username, setUsername] = useState('abhishek');
  const [password, setPassword] = useState('12345678');
  const [err, setErr] = useState('');
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await axios.post('http://localhost:4000/login', { username, password }, { withCredentials: true });
      dispatch(setUser({ username }));
      navigate('/content');
    } catch (error: any) {
      setErr(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await axios.post('http://localhost:4000/signup', { username, password }, { withCredentials: true });
      setIsLoginForm(true);
      setErr('');
    } catch (error: any) {
      setErr(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isLoginForm) handleLogin(e);
    else handleSignup(e);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0a1628' }}
    >
      {/* Background nautical pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #d4a017 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Top rope decoration */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-px flex-1" style={{ backgroundColor: '#d4a017', opacity: 0.4 }} />
          <Logo size="lg" />
          <div className="h-px flex-1" style={{ backgroundColor: '#d4a017', opacity: 0.4 }} />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: '#111f38',
            border: '2px solid #1e3a5f',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: "'Cinzel', serif", color: '#d4a017', letterSpacing: '0.05em' }}
            >
              {isLoginForm ? 'Set Sail Again' : 'Join the Crew'}
            </h1>
            <p style={{ color: '#7a8fa6', fontFamily: "'Crimson Text', serif", fontSize: '1rem' }}>
              {isLoginForm ? 'Your Log Pose awaits, Navigator.' : 'Begin your voyage across the Grand Line.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5 tracking-wide"
                style={{ color: '#d4a017', fontFamily: "'Cinzel', serif", fontSize: '0.75rem' }}
              >
                ⚓ Pirate Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. monkey_d_luffy"
                className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                style={{
                  backgroundColor: '#0d1f3c',
                  border: '1.5px solid #1e3a5f',
                  color: '#f5f0e8',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '1rem',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#d4a017')}
                onBlur={(e) => (e.target.style.borderColor = '#1e3a5f')}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5 tracking-wide"
                style={{ color: '#d4a017', fontFamily: "'Cinzel', serif", fontSize: '0.75rem' }}
              >
                🗝️ Secret Code
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Keep it safe from the Marines"
                className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                style={{
                  backgroundColor: '#0d1f3c',
                  border: '1.5px solid #1e3a5f',
                  color: '#f5f0e8',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '1rem',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#d4a017')}
                onBlur={(e) => (e.target.style.borderColor = '#1e3a5f')}
              />
            </div>

            {/* Error */}
            {err && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: 'rgba(185,28,28,0.15)',
                  border: '1.5px solid #b91c1c',
                  color: '#ef4444',
                  fontFamily: "'Crimson Text', serif",
                }}
              >
                ⚠️ {err}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: '#d4a017',
                color: '#0a1628',
                fontFamily: "'Cinzel', serif",
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                boxShadow: '0 4px 20px rgba(212,160,23,0.25)',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#f0c040'); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#d4a017'); }}
            >
              {loading ? '⚓ Navigating...' : isLoginForm ? '⚓ Set Sail' : '🏴‍☠️ Join the Crew'}
            </button>
          </form>

          {/* Switch form */}
          <div className="text-center mt-6">
            <span style={{ color: '#7a8fa6', fontFamily: "'Crimson Text', serif" }}>
              {isLoginForm ? "No crew yet? " : "Already sailing? "}
            </span>
            <button
              onClick={() => { setIsLoginForm(!isLoginForm); setErr(''); }}
              className="font-semibold underline transition-colors"
              style={{ color: '#d4a017', fontFamily: "'Crimson Text', serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f0c040')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d4a017')}
            >
              {isLoginForm ? 'Create your Log Pose' : 'Sign back in'}
            </button>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center gap-3 mt-6 justify-center">
          <div className="h-px flex-1" style={{ backgroundColor: '#d4a017', opacity: 0.2 }} />
          <span style={{ color: '#d4a017', opacity: 0.4, fontSize: '1.2rem' }}>⚓</span>
          <div className="h-px flex-1" style={{ backgroundColor: '#d4a017', opacity: 0.2 }} />
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
