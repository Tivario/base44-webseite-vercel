import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';

export default function MyFavorites() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: favorites, isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      const favs = await base44.entities.Favorite.filter({ user_email: user.email });
      const productIds = favs.map(f => f.product_id);
      if (productIds.length === 0) return [];
      const products = await base44.entities.Product.filter({ status: 'aktiv' });
      return products.filter(p => productIds.includes(p.id));
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Meine Favoriten
        </h1>
        <p className="text-[#6B8CA8] mb-8">{favorites?.length || 0} gespeicherte Artikel</p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#EBF5FF] rounded-2xl mb-3" />
                <div className="h-4 bg-[#EBF5FF] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : favorites?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E0EEF8]">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#EBF5FF] flex items-center justify-center">
              <Heart className="w-10 h-10 text-[#6B8CA8]" />
            </div>
            <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Keine Favoriten</h3>
            <p className="text-[#6B8CA8] mb-6">Speichere Artikel, die dir gefallen</p>
            <Link to={createPageUrl('Search')}>
              <button className="px-6 py-3 bg-gradient-to-r from-[#7AB8E8] to-[#A8D5F2] text-white rounded-xl">
                Artikel entdecken
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                userEmail={user?.email}
                isFavorited={true}
                onFavoriteChange={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}