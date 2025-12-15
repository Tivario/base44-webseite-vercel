import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight, TrendingUp, ArrowRightLeft, MapPin, Shield, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductGrid from '../components/products/ProductGrid';
import { motion } from 'framer-motion';

const categories = [
  { id: 'oberteile', label: 'Oberteile', emoji: '👕' },
  { id: 'hosen', label: 'Hosen', emoji: '👖' },
  { id: 'kleider', label: 'Kleider', emoji: '👗' },
  { id: 'schuhe', label: 'Schuhe', emoji: '👟' },
  { id: 'jacken', label: 'Jacken', emoji: '🧥' },
  { id: 'taschen', label: 'Taschen', emoji: '👜' },
  { id: 'accessoires', label: 'Accessoires', emoji: '💍' },
  { id: 'sportswear', label: 'Sport', emoji: '🏃' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      loadFavorites(userData.email);
    } catch (e) {}
  };

  const loadFavorites = async (email) => {
    try {
      const favs = await base44.entities.Favorite.filter({ user_email: email });
      setFavorites(favs);
    } catch (e) {}
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => base44.entities.Product.filter({ status: 'aktiv' }, '-created_date', 20),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = createPageUrl(`Search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2A4D66] via-[#3A5D7A] to-[#2A4D66] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#A8D5F2] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#A8D5F2] rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Second-Hand.
              <br />
              <span className="text-[#A8D5F2]">First Choice.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto">
              Entdecke einzigartige Fashion-Pieces, tausche Kleidung und verkaufe was du nicht mehr trägst.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-3 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    placeholder="Was suchst du?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 h-14 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 text-lg"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg" 
                  className="h-14 px-8 bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white rounded-xl"
                >
                  Suchen
                </Button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link 
                to={createPageUrl('Search?mode=local')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 text-sm transition-all"
              >
                <MapPin className="w-4 h-4" />
                Lokal & International
              </Link>
              <Link 
                to={createPageUrl('Search?trade=ja')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 text-sm transition-all"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Zum Tauschen
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-[#E0EEF8]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: 'Lokal & International', desc: 'Finde Artikel in deiner Nähe oder weltweit' },
              { icon: ArrowRightLeft, title: 'Kaufen & Tauschen', desc: 'Tausche Kleidung statt nur zu kaufen' },
              { icon: Shield, title: 'Sicherer Handel', desc: 'Geschützte Transaktionen & Support' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-[#EBF5FF]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#A8D5F2]/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-[#7AB8E8]" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#2A4D66] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#6B8CA8]">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2A4D66]">
              Kategorien
            </h2>
            <Link 
              to={createPageUrl('Search')}
              className="flex items-center gap-1 text-[#7AB8E8] hover:text-[#6BB5E8] font-medium"
            >
              Alle anzeigen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  to={createPageUrl(`Search?category=${cat.id}`)}
                  className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-[#E0EEF8] hover:border-[#A8D5F2] hover:shadow-lg transition-all"
                >
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-[#2A4D66]">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2A4D66]">
                Neu eingetroffen
              </h2>
              <p className="text-[#6B8CA8] mt-1">Die neuesten Artikel auf Tivaro</p>
            </div>
            <Link 
              to={createPageUrl('Search')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#2A4D66] hover:bg-[#3A5D7A] text-white rounded-xl font-medium transition-colors"
            >
              Alle anzeigen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ProductGrid 
            products={products || []}
            userEmail={user?.email}
            favorites={favorites}
            onFavoriteChange={() => user && loadFavorites(user.email)}
            loading={isLoading}
          />

          <div className="mt-8 text-center md:hidden">
            <Link 
              to={createPageUrl('Search')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A4D66] hover:bg-[#3A5D7A] text-white rounded-xl font-medium transition-colors"
            >
              Alle Artikel entdecken
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            className="relative bg-gradient-to-br from-[#A8D5F2] to-[#7AB8E8] rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative p-8 md:p-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Bereit zum Verkaufen?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Gib deiner Kleidung ein neues Leben. Verkaufe oder tausche in wenigen Minuten.
              </p>
              <Link to={createPageUrl('CreateProduct')}>
                <Button 
                  size="lg"
                  className="bg-white text-[#7AB8E8] hover:bg-white/90 px-8 py-6 text-lg rounded-xl font-semibold"
                >
                  Jetzt Artikel einstellen
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}