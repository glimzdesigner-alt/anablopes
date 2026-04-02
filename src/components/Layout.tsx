import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-pink-50 text-gray-900 font-sans">
      <header className="bg-black text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-pink-300">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Studio Ana B. Lopes
          </Link>
          <Link to="/admin/login" className="text-sm text-gray-400 hover:text-pink-300 transition-colors">
            Admin
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-black text-gray-400 text-center py-6 mt-12">
        <p>© {new Date().getFullYear()} Studio Ana B. Lopes. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
