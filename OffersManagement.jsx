import React, { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Check, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function OffersManagement() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('offen');
  const [counterOffers, setCounterOffers] = useState({});
  const queryClient = useQueryClient();

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

  const { data: offers, isLoading } = useQuery({
    queryKey: ['seller-offers', user?.email, filter],
    queryFn: async () => {
      if (filter === 'alle') {
        return base44.entities.Offer.filter({ seller_email: user.email }, '-created_date');
      }
      return base44.entities.Offer.filter({ 
        seller_email: user.email, 
        status: filter 
      }, '-created_date');
    },
    enabled: !!user,
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Offer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-offers']);
      toast.success('Angebot aktualisiert');
      setCounterOffers({});
    },
  });

  const handleAccept = async (offer) => {
    const finalPrice = offer.status === 'gegenvorschlag' ? offer.counter_price : offer.proposed_price;
    
    updateOfferMutation.mutate({
      id: offer.id,
      data: { status: 'angenommen' }
    });

    // Create checkout for this price
    // Note: In real implementation, this would redirect to a special checkout
    toast.success(`Angebot angenommen für ${finalPrice.toFixed(2)} €`);
  };

  const handleReject = (offer) => {
    updateOfferMutation.mutate({
      id: offer.id,
      data: { status: 'abgelehnt' }
    });
  };

  const handleCounter = (offer) => {
    const counterPrice = parseFloat(counterOffers[offer.id]);
    if (!counterPrice || counterPrice <= 0) {
      toast.error('Bitte gib einen gültigen Preis ein');
      return;
    }

    updateOfferMutation.mutate({
      id: offer.id,
      data: {
        counter_price: counterPrice,
        status: 'gegenvorschlag',
        last_action_by: 'seller'
      }
    });
  };

  const statusColors = {
    offen: 'bg-yellow-100 text-yellow-800',
    gegenvorschlag: 'bg-blue-100 text-blue-800',
    angenommen: 'bg-green-100 text-green-800',
    abgelehnt: 'bg-red-100 text-red-800',
    abgelaufen: 'bg-gray-100 text-gray-800',
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Angebote...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück zum Profil
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Preisangebote verwalten
        </h1>
        <p className="text-[#6B8CA8]">Übersicht aller Preisvorschläge für deine Artikel</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-[#EBF5FF] p-1 rounded-xl mb-6">
          <TabsTrigger value="offen">Offen</TabsTrigger>
          <TabsTrigger value="gegenvorschlag">Gegenvorschlag</TabsTrigger>
          <TabsTrigger value="angenommen">Angenommen</TabsTrigger>
          <TabsTrigger value="alle">Alle</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-[#6B8CA8]">Lade Angebote...</p>
            </div>
          ) : !offers || offers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <TrendingDown className="w-12 h-12 mx-auto mb-4 text-[#6B8CA8]" />
              <p className="text-[#6B8CA8]">Keine Angebote gefunden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                const currentPrice = offer.status === 'gegenvorschlag' ? offer.counter_price : offer.proposed_price;
                const isExpired = new Date(offer.expires_at) < new Date();
                
                return (
                  <Card key={offer.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#EBF5FF] shrink-0">
                          {offer.product_image && (
                            <img src={offer.product_image} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-[#2A4D66] mb-1">{offer.product_title}</h3>
                              <p className="text-sm text-[#6B8CA8]">
                                Von: {offer.buyer_email.split('@')[0]}
                              </p>
                            </div>
                            <Badge className={statusColors[isExpired ? 'abgelaufen' : offer.status]}>
                              {isExpired ? 'Abgelaufen' :
                               offer.status === 'offen' ? 'Offen' :
                               offer.status === 'gegenvorschlag' ? 'Gegenvorschlag' :
                               offer.status === 'angenommen' ? 'Angenommen' : 'Abgelehnt'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-[#6B8CA8]">Original</p>
                              <p className="font-medium text-[#2A4D66]">{offer.original_price.toFixed(2)} €</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#6B8CA8]">Angebot</p>
                              <p className="font-bold text-[#7AB8E8]">{offer.proposed_price.toFixed(2)} €</p>
                            </div>
                            {offer.counter_price && (
                              <div>
                                <p className="text-xs text-[#6B8CA8]">Dein Gegenvorschlag</p>
                                <p className="font-bold text-blue-600">{offer.counter_price.toFixed(2)} €</p>
                              </div>
                            )}
                          </div>

                          {(offer.status === 'offen' || (offer.status === 'gegenvorschlag' && offer.last_action_by === 'buyer')) && !isExpired && (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Label className="text-xs text-[#6B8CA8]">Gegenvorschlag</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={counterOffers[offer.id] || ''}
                                      onChange={(e) => setCounterOffers({
                                        ...counterOffers,
                                        [offer.id]: e.target.value
                                      })}
                                      placeholder="Dein Preis"
                                      className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8CA8] text-sm">€</span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleCounter(offer)}
                                  disabled={!counterOffers[offer.id]}
                                  className="self-end bg-blue-500 hover:bg-blue-600"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAccept(offer)}
                                  className="flex-1 bg-green-500 hover:bg-green-600"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Annehmen
                                </Button>
                                <Button
                                  onClick={() => handleReject(offer)}
                                  variant="outline"
                                  className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Ablehnen
                                </Button>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-[#6B8CA8] mt-3">
                            Erstellt: {new Date(offer.created_date).toLocaleDateString('de-DE')} • 
                            Gültig bis: {new Date(offer.expires_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}