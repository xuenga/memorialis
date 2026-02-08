import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { api } from '@/api/apiClient';
import { Menu, X, ShoppingBag, User, QrCode, LogOut, LogIn, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const { user: authUser, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCartCount = React.useCallback(async () => {
    let sessionId = localStorage.getItem('memorialis_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('memorialis_session', sessionId);
    }
    try {
      const items = await api.entities.CartItem.filter({ session_id: sessionId });
      setCartCount(items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
    } catch (e) {
      console.error("Error loading cart count:", e);
    }
  }, []);

  useEffect(() => {
    loadCartCount();
    window.addEventListener('cartUpdated', loadCartCount);
    window.addEventListener('storage', loadCartCount); // Also listen for storage changes
    return () => {
      window.removeEventListener('cartUpdated', loadCartCount);
      window.removeEventListener('storage', loadCartCount);
    };
  }, [loadCartCount]);

  useEffect(() => {
    loadCartCount();
  }, [currentPageName, loadCartCount]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Not authenticated
      }
    };
    loadUser();
  }, []);

  const navLinks = [
    { name: 'Accueil', page: 'Home' },
    { name: 'Produits', page: 'Products' },
    { name: 'Fonctionnement', page: 'HowItWorks' },
    { name: 'Contact', page: 'Contact' },
  ];

  const isMemorialPage = currentPageName === 'ViewMemorial';

  if (isMemorialPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-background/95 backdrop-blur-md shadow-lg py-2'
        : (currentPageName === 'Home' ? 'bg-transparent py-6' : 'bg-background/50 backdrop-blur-sm py-4')
        }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${isScrolled || currentPageName !== 'Home' ? 'bg-primary text-accent' : 'bg-accent text-primary'
                } group-hover:scale-110 group-hover:shadow-accent/20 group-hover:shadow-lg`}>
                <QrCode className="w-7 h-7 lg:w-8 lg:h-8 transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="block">
                <h1 className={`font-serif text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide transition-colors duration-300 ${isScrolled || currentPageName !== 'Home' ? 'text-primary' : 'text-white'
                  }`}>
                  Memorialis
                </h1>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = currentPageName === link.page;
                const isLightText = !isScrolled && currentPageName === 'Home';

                return (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`font-sans text-sm font-semibold tracking-widest uppercase transition-all duration-300 relative py-2 group ${isActive
                      ? (isLightText ? 'text-accent' : 'text-[#b48c00]')
                      : (isLightText ? 'text-white/80 hover:text-white' : 'text-primary hover:text-[#b48c00]')
                      }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 transform origin-left transition-transform duration-500 ${isActive ? 'scale-x-100 bg-[#b48c00]' : 'scale-x-0 bg-accent group-hover:scale-x-100'
                      }`} />
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to={createPageUrl('Cart')}
                title="Mon Panier"
                className={`group flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full transition-all duration-500 relative ${isScrolled || currentPageName !== 'Home' ? 'hover:bg-accent/10' : 'hover:bg-white/10'
                  }`}
              >
                <div className="relative">
                  <ShoppingBag className={`w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-500 ${isScrolled || currentPageName !== 'Home' ? 'text-primary' : 'text-white'
                    } group-hover:text-accent`} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300 border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Account - Conditional rendering based on auth state */}
              {authUser ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    to={createPageUrl('MyMemorials')}
                    title="Mes Mémoriaux"
                    className={`flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full transition-all duration-500 group relative ${isScrolled || currentPageName !== 'Home' ? 'hover:bg-accent/10' : 'hover:bg-white/10'
                      }`}
                  >
                    <User className={`w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300 ${isScrolled || currentPageName !== 'Home' ? 'text-primary' : 'text-white'
                      } group-hover:text-accent`} />
                    {/* Green indicator for connected user */}
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md animate-pulse" />
                  </Link>
                  <button
                    onClick={() => signOut()}
                    title="Déconnexion"
                    className={`flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full transition-all duration-500 group ${isScrolled || currentPageName !== 'Home' ? 'hover:bg-red-50' : 'hover:bg-white/10'
                      }`}
                  >
                    <LogOut className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors duration-300 ${isScrolled || currentPageName !== 'Home' ? 'text-primary' : 'text-white'
                      } group-hover:text-red-600`} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-500 ${isScrolled || currentPageName !== 'Home'
                    ? 'bg-accent text-primary hover:bg-accent/90 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
              )}

              {/* Admin link - only for admins */}
              {authUser && authUser.user_metadata?.role === 'admin' && (
                <Link
                  to="/admin"
                  title="Administration"
                  className={`hidden sm:flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full transition-all duration-500 ${isScrolled || currentPageName !== 'Home' ? 'bg-purple-50 hover:bg-purple-100' : 'bg-white/20 hover:bg-white/30'
                    }`}
                >
                  <svg className="w-5 h-5 text-purple-600" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(true)}
                className={`lg:hidden p-2.5 rounded-full transition-all duration-300 ${isScrolled || currentPageName !== 'Home' ? 'hover:bg-primary/5 text-primary' : 'hover:bg-white/10 text-white'
                  }`}
              >
                <Menu className="w-6 h-6 hover:text-accent transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary z-[100] lg:hidden"
          >
            <div className="flex flex-col h-full p-8">
              <div className="flex justify-between items-center mb-16">
                <span className="font-serif text-3xl text-white">Memorialis</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-7 h-7 text-white" />
                </button>
              </div>

              <nav className="flex flex-col gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={createPageUrl(link.page)}
                      onClick={() => setIsMenuOpen(false)}
                      className="font-serif text-4xl text-white hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}\r\n                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {authUser ? (
                    <>
                      <Link
                        to={createPageUrl('MyMemorials')}
                        onClick={() => setIsMenuOpen(false)}
                        className="font-serif text-4xl text-white hover:text-accent transition-colors"
                      >
                        Mes Mémoriaux
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="font-serif text-4xl text-white hover:text-accent transition-colors"
                      >
                        Connexion
                      </Link>
                    </>
                  )}
                </motion.div>
                {authUser && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="font-serif text-4xl text-white hover:text-red-400 transition-colors flex items-center gap-4"
                    >
                      <LogOut className="w-8 h-8" />
                      Déconnexion
                    </button>
                  </motion.div>
                )}
              </nav>

              <div className="mt-auto pt-10 border-t border-white/10">
                {authUser && (
                  <div className="mb-6">
                    <p className="text-white/40 text-sm mb-2 tracking-widest uppercase">Connecté en tant que</p>
                    <p className="text-white text-lg">{authUser.user_metadata?.full_name || authUser.email}</p>
                  </div>
                )}
                <div className="flex gap-6">
                  {/* Social icons placeholder */}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`min-h-[70vh] ${currentPageName !== 'Home' ? 'pt-24 lg:pt-32' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white mt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <span className="font-serif text-2xl text-white">Memorialis</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Notre mission est d'offrir à chaque famille un lieu de recueillement unique et éternel,
                reliant le présent au passé par la technologie.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-serif text-xl text-white mb-8">Navigation</h4>
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.page}>
                    <Link
                      to={createPageUrl(link.page)}
                      className="text-white/60 hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-serif text-xl text-white mb-8">Informations</h4>
              <ul className="space-y-4">
                <li><Link to={createPageUrl('CGV')} className="text-white/60 hover:text-accent transition-colors">CGV</Link></li>
                <li><Link to={createPageUrl('Privacy')} className="text-white/60 hover:text-accent transition-colors">Confidentialité</Link></li>
                <li><Link to={createPageUrl('Mentions')} className="text-white/60 hover:text-accent transition-colors">Mentions légales</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif text-xl text-white mb-8">Contact</h4>
              <div className="space-y-4 text-white/60">
                <p>contact@memorialis.shop</p>
                <p>France</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/30">
              © 2026 Memorialis. "Un scan, une vie, mille souvenirs"
            </p>
            <div className="flex items-center gap-8">
              {/* Payment icons placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
