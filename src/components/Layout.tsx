import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, ShoppingBasket, BarChart3, Menu, X, Globe, LogOut } from 'lucide-react';
import { Language, t } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
}

const navItems = [
  { path: '/', icon: Sprout, key: 'nav.farmer' },
  { path: '/marketplace', icon: ShoppingBasket, key: 'nav.marketplace' },
  { path: '/admin', icon: BarChart3, key: 'nav.admin' },
];

const langLabels: Record<Language, string> = { en: 'EN', hi: 'हिं', kn: 'ಕನ್' };

export default function Layout({ children, lang, setLang }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full harvest-gradient flex items-center justify-center">
              <Sprout className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg text-foreground">FarmChain</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${active ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.key, lang)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center gap-1 glass-card rounded-full p-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground ml-2" />
              {(['en', 'hi', 'kn'] as Language[]).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {langLabels[l]}
                </button>
              ))}
            </div>

            {/* Sign out */}
            {user && (
              <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-full hover:bg-accent">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/20">
              <div className="p-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${location.pathname === item.path ? 'bg-accent text-primary' : 'text-muted-foreground'}`}>
                    <item.icon className="w-5 h-5" />
                    {t(item.key, lang)}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
