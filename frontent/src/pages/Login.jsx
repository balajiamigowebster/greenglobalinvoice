import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../redux/Slices/authSlice";
import API from "../api";
import { Lock, Mail, User, Key, Sparkles, LogIn, UserPlus } from "lucide-react";

const DEMO_CREDENTIALS = {
  email: "admin@example.com",
  password: "admin123",
};

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const fillDemoCredentials = () => {
    setIsRegister(false);
    setForm({
      name: "",
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });
    setCustomError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError("");
    setSuccessMsg("");
    setLoading(true);

    if (isRegister) {
      try {
        const res = await API.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setSuccessMsg(res.data.msg || "Registered successfully! Please log in.");
        setIsRegister(false);
        setForm((prev) => ({ ...prev, password: "" }));
      } catch (err) {
        setCustomError(err.response?.data?.msg || err.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await dispatch(loginUser({ email: form.email, password: form.password }));
        if (res.meta.requestStatus === "fulfilled") {
          navigate("/dashboard");
        } else {
          setCustomError(res.payload || "Login failed. Please check your credentials.");
        }
      } catch (err) {
        setCustomError("Something went wrong connecting to the server.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Demo Credentials Banner */}
        <div className="bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md rounded-xl p-4 mb-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Login Details</span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium px-2.5 py-1 rounded-md border border-emerald-500/40 transition cursor-pointer"
            >
              Autofill
            </button>
          </div>
          <div className="space-y-1 text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-slate-200 select-all font-semibold">admin@example.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Password:</span>
              <span className="text-slate-200 select-all font-semibold">admin123</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isRegister
                ? "Enter your details to register a new account"
                : "Enter your credentials to access the invoice portal"}
            </p>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-1 rounded-lg mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setCustomError("");
                setSuccessMsg("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition ${
                !isRegister
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setCustomError("");
                setSuccessMsg("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition ${
                isRegister
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg mb-4">
              {successMsg}
            </div>
          )}

          {(customError || error) && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg mb-4">
              {customError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    required={isRegister}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-60 cursor-pointer shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>{isRegister ? "Creating account..." : "Signing in..."}</span>
              ) : (
                <>
                  {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{isRegister ? "Register" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
