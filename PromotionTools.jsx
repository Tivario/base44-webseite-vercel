import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Zap, Star, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PromotionTools() {
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

  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.email],
    queryFn: () => base44.entities.Product.filter({ seller_email: user.email, status: 'aktiv' }),
    enabled: !!user,
  });

  const { data: promotions } = useQuery({
    queryKey: ['my-promotions', user?.email],
    queryFn: () => base44.entities.Promotion.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const promotionTypes = [
    {
      type: 'boost_24h',
      name: '24h Boost',
      description: 'Dein Artikel erscheint 24h ganz oben in den Suchergebnissen',
      price: 2.99,
      icon: Zap,
      color: 'from-amber-500 to-orange-600'
    },
    {
      type: 'boost_7_days',
      name: '7 Tage Boost',
      description: 'Dein Artikel erscheint 7 Tage lang prominent platziert',
      price: 9.99,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600'
    },
    {
      type: 'highlight_24h',
      name: '24h Highlight',
      description: 'Dein Artikel wird mit einem speziellen Badge hervorgehoben',
      price: 1.99,
      icon: Star,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      type: 'homepage_featured',
      name: 'Homepage-Feature',
      description: 'Dein Artikel erscheint auf der Startseite (24h)',
      price: 14.99,
      icon: Star,
      color: 'from-purple-500 to-pink-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Promotion-Tools
        </h1>
        <p className="text-[#6B8CA8] mb-8">Hebe deine Artikel hervor und erreiche mehr Käufer</p>

        {/* Promotion Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {promotionTypes.map((promo) => (
            <Card key={promo.type} className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${promo.color} flex items-center justify-center shadow-lg`}>
                      <promo.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-[#2A4D66]">{promo.name}</CardTitle>
                      <p className="text-sm text-[#6B8CA8] mt-1">{promo.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-[#2A4D66]">{promo.price.toFixed(2)} €</p>
                  <Button className="bg-gradient-to-r from-[#7AB8E8] to-[#A8D5F2] text-white">
                    Jetzt buchen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Promotions */}
        {promotions && promotions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#2A4D66]">Aktive Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {promotions.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-4 bg-[#F8FBFF] rounded-xl">
                    <div>
                      <p className="font-medium text-[#2A4D66]">{promo.product_title}</p>
                      <p className="text-sm text-[#6B8CA8]">
                        {promo.type.replace(/_/g, ' ')} • Bis {new Date(promo.end_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge className={promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {promo.status === 'active' ? 'Aktiv' : promo.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}