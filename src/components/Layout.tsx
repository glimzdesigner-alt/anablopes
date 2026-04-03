import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, CalendarClock, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-white text-brand-black font-sans flex flex-col">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'py-4 glass border-b border-brand-pink/10' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-brand-black text-brand-pink rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tight text-brand-black leading-none">
                Ana B. Lopes
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-pink font-bold mt-1">
                Studio de Cílios
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/schedule" 
              className="text-sm font-bold text-brand-black hover:text-brand-pink transition-colors uppercase tracking-widest"
            >
              Agendar
            </Link>
            <Link 
              to="/my-bookings" 
              className="flex items-center gap-2 text-sm font-bold text-brand-black hover:text-brand-pink transition-colors uppercase tracking-widest"
            >
              <CalendarClock className="w-4 h-4" />
              Meus Agendamentos
            </Link>
            <Link 
              to="/admin/login" 
              className="w-10 h-10 rounded-full bg-brand-black/5 flex items-center justify-center text-brand-black hover:bg-brand-pink hover:text-white transition-all"
            >
              <User className="w-5 h-5" />
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 flex items-center justify-center text-brand-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass border-b border-brand-pink/10 p-6 space-y-6 animate-in slide-in-from-top duration-300">
            <Link to="/schedule" className="block text-lg font-bold text-brand-black uppercase tracking-widest">
              Agendar
            </Link>
            <Link to="/my-bookings" className="block text-lg font-bold text-brand-black uppercase tracking-widest">
              Meus Agendamentos
            </Link>
            <Link to="/admin/login" className="block text-lg font-bold text-brand-black uppercase tracking-widest">
              Admin
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 pt-24">
        <Outlet />
      </main>

      <footer className="bg-brand-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-pink text-white rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-2xl font-serif font-bold">Ana B. Lopes</span>
              </Link>
              <p className="text-white/50 font-light leading-relaxed">
                Especialista em extensões de cílios, realçando sua beleza natural com técnica e sofisticação.
              </p>
            </div>
            
            <div>
              <h4 className="text-brand-pink font-bold uppercase tracking-widest text-sm mb-8">Links Rápidos</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-white/70 hover:text-brand-pink transition-colors">Início</Link></li>
                <li><Link to="/schedule" className="text-white/70 hover:text-brand-pink transition-colors">Agendar Horário</Link></li>
                <li><Link to="/my-bookings" className="text-white/70 hover:text-brand-pink transition-colors">Meus Agendamentos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-brand-pink font-bold uppercase tracking-widest text-sm mb-8">Contato</h4>
              <p className="text-white/70 mb-4">Recife, Pernambuco</p>
              <p className="text-white/70">contato@anablopes.com</p>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/30 text-sm">© {new Date().getFullYear()} Studio Ana B. Lopes. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link to="/admin/login" className="text-white/30 hover:text-brand-pink text-sm transition-colors uppercase tracking-widest">Acesso Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

