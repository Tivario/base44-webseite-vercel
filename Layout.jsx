
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  User,
  Heart,
  Package,
  LogOut,
  Menu,
  X,
  BarChart3,
  Shield,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import CookieBanner from './components/CookieBanner';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      loadUnreadCount(userData.email);
    } catch (e) {
      // Not logged in
    }
  };

  const loadUnreadCount = async (email) => {
    try {
      const conversations = await base44.entities.Conversation.filter({
        $or: [
          { seller_email: email },
          { buyer_email: email }
        ]
      });
      let count = 0;
      conversations.forEach(c => {
        if (c.seller_email === email) count += c.unread_seller || 0;
        else count += c.unread_buyer || 0;
      });
      setUnreadMessages(count);
    } catch (e) {}
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Suchen', icon: Search, page: 'Search' },
    { name: 'Verkaufen', icon: PlusCircle, page: 'CreateProduct' },
    { name: 'Nachrichten', icon: MessageCircle, page: 'Messages', badge: unreadMessages },
    { name: 'Profil', icon: User, page: 'Profile' },
  ];

  const mobileNavItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Suchen', icon: Search, page: 'Search' },
    { name: 'Verkaufen', icon: PlusCircle, page: 'CreateProduct' },
    { name: 'Nachrichten', icon: MessageCircle, page: 'Messages', badge: unreadMessages },
    { name: 'Profil', icon: User, page: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FBFF]">
      <style>{`
        :root {
          --color-primary: #A8D5F2;
          --color-primary-dark: #7AB8E8;
          --color-dark: #2A4D66;
          --color-light: #F8FBFF;
          --color-cream: #EBF5FF;
          --color-muted: #6B8CA8;
        }
        
        .font-display {
          font-family: 'Inter', system-ui, sans-serif;
          letter-spacing: -0.02em;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E0EEF8]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 mr-12">
            <div className="relative">
              <span className="font-display font-black text-2xl bg-gradient-to-br from-[#A8D5F2] via-[#7AB8E8] to-[#5BA3D6] bg-clip-text text-transparent drop-shadow-sm">
                Tivario
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#A8D5F2]/20 via-transparent to-[#7AB8E8]/20 blur-lg -z-10"></div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentPageName === item.page
                    ? 'bg-[#A8D5F2] text-white'
                    : 'text-[#2A4D66] hover:bg-[#EBF5FF]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
                {item.badge > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={createPageUrl('Dashboard')}>
                  <Button variant="outline" size="sm" className="border-[#A8D5F2] text-[#7AB8E8] hover:bg-[#A8D5F2] hover:text-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to={createPageUrl('Orders')}>
                  <Button variant="outline" size="sm" className="border-[#A8D5F2] text-[#7AB8E8] hover:bg-[#A8D5F2] hover:text-white">
                    <Package className="w-4 h-4 mr-2" />
                    Bestellungen
                  </Button>
                </Link>
                <div className="h-8 w-8 rounded-full bg-[#A8D5F2] flex items-center justify-center text-white font-medium text-sm">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 text-[#6B8CA8]" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                className="bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
              >
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E0EEF8]">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="relative">
              <span className="font-display font-black text-xl bg-gradient-to-br from-[#A8D5F2] via-[#7AB8E8] to-[#5BA3D6] bg-clip-text text-transparent">
                Tivario
              </span>
            </div>
          </Link>
          
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-b border-[#E0EEF8] overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentPageName === item.page
                        ? 'bg-[#A8D5F2] text-white'
                        : 'text-[#2A4D66] hover:bg-[#EBF5FF]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white">{item.badge}</Badge>
                    )}
                  </Link>
                ))}
                <Link
                  to={createPageUrl('Dashboard')}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#2A4D66] hover:bg-[#EBF5FF]"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Seller Dashboard</span>
                </Link>
                <Link
                  to={createPageUrl('Wallet')}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#2A4D66] hover:bg-[#EBF5FF]"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Wallet</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-14 md:pt-16 pb-20 md:pb-8">
        {children}
      </main>

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E0EEF8] z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                currentPageName === item.page
                  ? 'text-[#7AB8E8]'
                  : 'text-[#6B8CA8]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
              {item.badge > 0 && (
                <Badge className="absolute -top-1 right-0 h-4 min-w-4 bg-red-500 text-white text-[10px] px-1">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
