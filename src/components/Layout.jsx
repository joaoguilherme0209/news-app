import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon, Search } from 'lucide-react';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleFocusSearch = () => {
    window.dispatchEvent(new Event('focus-search'));
  };

  const navLinks = (
    <>
      {location.pathname === '/' && (
        <Button variant="ghost" size="sm" onClick={handleFocusSearch}>
          <Search className="size-4" />
        </Button>
      )}
      <Link to="/" onClick={() => setMenuOpen(false)}>
        <Button variant="ghost" size="sm">Buscar</Button>
      </Link>
      <Link to="/collections" onClick={() => setMenuOpen(false)}>
        <Button variant="ghost" size="sm">Minhas Coleções</Button>
      </Link>
      <Link to="/profile" onClick={() => setMenuOpen(false)}>
        <Button variant="ghost" size="sm">Perfil</Button>
      </Link>
      <span className="text-muted-foreground text-sm hidden sm:inline">{user?.email}</span>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
        Sair
      </Button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="text-xl font-semibold text-foreground hover:opacity-90">
              News App
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {navLinks}
            </nav>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((o) => !o)}
              className="sm:hidden"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
            </Button>
          </div>
          {menuOpen && (
            <nav className="sm:hidden flex flex-col gap-1 py-3 border-t">
              {navLinks}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
