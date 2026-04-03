import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, loginWithEmail, loginWithGoogle } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && (user.email === 'admin@anablopes.com' || user.email === 'pernambucoresenhoso@gmail.com')) {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error('Google login failed', error);
      setErrorMsg(error.message || 'Erro ao fazer login com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMsg('E-mail ou senha incorretos. Verifique se você já criou a conta no Firebase.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMsg('O login por E-mail/Senha não está ativado no Firebase Authentication.');
      } else {
        setErrorMsg(error.message || 'Erro ao fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-pink/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-pink/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark p-10 md:p-16 rounded-[48px] shadow-3xl max-w-lg w-full text-center border border-white/10 relative z-10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-pink/10 mb-10">
          <ShieldCheck className="w-12 h-12 text-brand-pink" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Acesso Restrito</h1>
        <p className="text-nude-400 mb-12 font-light text-lg">Painel de administração Studio Ana B. Lopes.</p>
        
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl text-left flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-500 group-focus-within:text-brand-pink transition-colors" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all text-white text-lg"
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-500 group-focus-within:text-brand-pink transition-colors" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all text-white text-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-pink text-white py-5 rounded-2xl font-bold text-xl hover:bg-brand-pink-dark transition-all disabled:opacity-50 mt-4 shadow-xl shadow-brand-pink/20 uppercase tracking-widest"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-white/10">
          <p className="text-sm text-nude-500 mb-6 uppercase tracking-widest font-bold">Ou acesse com</p>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all disabled:opacity-50 group"
          >
            <img src="https://www.gstatic.com/firebase/explore/google.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Entrar com Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';

