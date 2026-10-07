import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-3">
        <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Verifying Security Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return children;
}
