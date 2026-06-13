import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const [username, setUsername] = useState("luffy");
  const [password, setPassword] = useState("@#Abhi2330");
  const [err, setErr] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await api.post("/login", { username, password });
      dispatch(setUser({ username }));
      navigate("/content");
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        setErr("Cannot reach the backend on port 4000. Start the backend server and make sure MongoDB is running.");
      } else {
        setErr(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await api.post("/signup", { username, password });
      setIsLoginForm(true);
      setErr("");
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        setErr("Cannot reach the backend on port 4000. Start the backend server and make sure MongoDB is running.");
      } else {
        setErr(error.response?.data?.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isLoginForm) handleLogin(e);
    else handleSignup(e);
  };

  return (
    <div className="bento-shell min-h-screen px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-md flex-col justify-center">
        <div className="bento-card p-6 md:p-8">
          <div className="mb-6 text-center">
            <p className="text-2xl font-semibold text-slate-900">SecondBrain</p>
            <p className="mt-2 text-sm text-slate-500">
              {isLoginForm ? "Welcome back" : "Create your account"}
            </p>
          </div>

          <h1 className="bento-heading mb-6 text-center text-3xl text-slate-900">
            {isLoginForm ? "Sign in" : "Sign up"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="bento-label">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                className="bento-input"
              />
            </div>

            <div>
              <label className="bento-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bento-input"
              />
            </div>

            {err ? (
              <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {err}
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="bento-button bento-button-primary w-full">
              {loading ? "Please wait..." : isLoginForm ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            {isLoginForm ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLoginForm(!isLoginForm);
                setErr("");
              }}
              className="font-semibold text-slate-900 underline underline-offset-4"
            >
              {isLoginForm ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        <button className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
      </div>
    </div>
  );
};

export default LoginSignup;
