import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, logout } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LayoutDashboard, Settings, Image, Tag, LogOut, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const adminEmails = ['admin@anablopes.com', 'pernambucoresenhoso@gmail.com'];
      if (!user || !adminEmails.includes(user.email || '')) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-black text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Sparkles className="w-12 h-12 text-brand-pink" />
        </motion.div>
        <p className="text-xl font-serif tracking-widest animate-pulse">CARREGANDO PAINEL...</p>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Painel' },
    { path: '/admin/models', icon: Image, label: 'Modelos' },
    { path: '/admin/promotions', icon: Tag, label: 'Promoções' },
    { path: '/admin/reviews', icon: MessageSquare, label: 'Avaliações' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-nude-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-brand-black text-white flex flex-col relative z-20 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-pink blur-[100px] rounded-full"></div>
        </div>

        <div className="p-10 relative z-10">
          <Link to="/admin" className="group">
            <h2 className="text-3xl font-serif text-white flex items-center gap-3 group-hover:text-brand-pink transition-colors">
              <Sparkles className="w-8 h-8 text-brand-pink group-hover:rotate-12 transition-transform" />
              Admin do <span className="text-brand-pink">Studio</span>
            </h2>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-3 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' 
                  : 'text-nude-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-brand-pink'}`} />
                  <span className="font-bold tracking-wide uppercase text-xs">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 relative z-10">
          <button
            onClick={() => logout()}
            className="flex items-center gap-4 px-6 py-4 w-full text-left text-nude-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wide uppercase text-xs">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

