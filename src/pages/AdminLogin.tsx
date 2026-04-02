import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, loginWithEmail } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'admin@anablopes.com') {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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
    <div className="min-h-screen bg-nude-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-nude-200/50 max-w-md w-full text-center border border-nude-100">
        <h1 className="text-3xl font-serif text-nude-900 mb-2">Acesso Restrito</h1>
        <p className="text-nude-500 mb-8 font-light">Faça login para acessar o painel de administração do Studio Ana B. Lopes.</p>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all text-left"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all text-left"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nude-900 text-gold-300 py-4 rounded-xl font-medium text-lg hover:bg-nude-800 transition-colors disabled:opacity-50 mt-4 uppercase tracking-wider"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
