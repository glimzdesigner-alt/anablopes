import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, logout } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LayoutDashboard, Settings, Image, Tag, LogOut, MessageSquare } from 'lucide-react';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== 'admin@anablopes.com') {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-nude-50">Carregando...</div>;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Agendamentos' },
    { path: '/admin/models', icon: Image, label: 'Modelos' },
    { path: '/admin/promotions', icon: Tag, label: 'Promoções' },
    { path: '/admin/reviews', icon: MessageSquare, label: 'Avaliações' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-nude-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-nude-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-serif text-gold-300">Admin Studio</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-gold-500 text-nude-900 font-medium' : 'text-nude-200 hover:bg-nude-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-nude-200 hover:bg-nude-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
