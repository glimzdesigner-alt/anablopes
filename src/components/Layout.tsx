import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-nude-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white border-b border-nude-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nude-900 text-gold-300 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-serif font-semibold tracking-wide text-nude-900">
              Ana B. Lopes
            </span>
          </Link>
          <Link to="/admin/login" className="text-sm font-medium text-nude-500 hover:text-nude-900 transition-colors uppercase tracking-wider">
            Admin
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        <Outlet />
      </main>
      <footer className="bg-nude-900 text-nude-200 text-center py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-6 h-6 text-gold-400" />
          </div>
          <p className="font-serif text-lg mb-2">Studio Ana B. Lopes</p>
          <p className="text-sm text-nude-400/80">© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
