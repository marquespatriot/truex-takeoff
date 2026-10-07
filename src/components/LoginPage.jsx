import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, Mail, AlertCircle, Shield, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password, rememberMe);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid username or password.');
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await forgotPassword(forgotEmail);
    setForgotMsg(res.message);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 selection:bg-lime-500 selection:text-black">
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-900/20 via-black to-black pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 my-8">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="bg-black p-3 rounded-2xl border border-zinc-800 inline-block shadow-lg">
            <img src="/logo.png" alt="TRUEX INSULATION Logo" className="h-12 object-contain mx-auto" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              FIELD MEASUREMENT SYSTEM
            </h1>
            <p className="text-xs text-zinc-400 font-semibold mt-1">
              Private Authorized Access Only
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-red-300 font-bold animate-fadeIn">
            <AlertCircle size={18} className="text-red-400 min-w-max" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-lime-400 mb-1.5 flex items-center gap-1.5">
              <Mail size={14} /> Username / Email Address
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter username or email..."
              className="w-full bg-black border-2 border-zinc-700 focus:border-lime-400 focus:ring-4 focus:ring-lime-500/20 rounded-2xl px-4 py-3.5 text-white text-base font-semibold placeholder:text-zinc-600 transition"
            />
          </div>

          {/* Password with Eye Icon Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <Lock size={14} /> Password
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-zinc-400 hover:text-lime-400 font-bold transition"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-black border-2 border-zinc-700 focus:border-lime-400 focus:ring-4 focus:ring-lime-500/20 rounded-2xl px-4 py-3.5 pr-12 text-white text-base font-semibold placeholder:text-zinc-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember this Device Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-lime-500"
              />
              <span>Remember this device</span>
            </label>

            <span className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
              <Shield size={12} className="text-lime-400" /> SSL Encrypted
            </span>
          </div>

          {/* Big Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-lime-500 hover:bg-lime-400 active:scale-98 text-black font-black text-lg uppercase tracking-wider shadow-xl shadow-lime-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <KeyRound size={20} strokeWidth={2.5} />
            <span>{isSubmitting ? 'Authenticating...' : 'LOG IN'}</span>
          </button>

        </form>

        {/* Footer info */}
        <div className="border-t border-zinc-800 pt-4 text-center text-[11px] text-zinc-500 font-semibold space-y-1">
          <p>© 2026 TRUEX INSULATION. All rights reserved.</p>
          <p className="text-zinc-600">Restricted application for authorized field estimators only.</p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <KeyRound size={18} className="text-lime-400" /> Reset Password
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-zinc-400 hover:text-white text-xs font-bold">
                Close
              </button>
            </div>

            {forgotMsg ? (
              <div className="p-4 bg-lime-500/10 border border-lime-500/30 rounded-xl text-xs text-lime-300 font-semibold space-y-2">
                <p>{forgotMsg}</p>
                <button
                  onClick={() => { setShowForgotModal(false); setForgotMsg(''); }}
                  className="w-full py-2 rounded-lg bg-lime-500 text-black font-bold text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Enter your authorized account username or email. Password reset instructions will be dispatched.
                </p>
                <input
                  type="text"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter username or email..."
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-lime-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-lime-500 text-black font-bold text-xs shadow"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
