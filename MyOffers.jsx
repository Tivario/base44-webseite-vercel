import React, { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function MyOffers() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('offen');
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
    queryKey: ['buyer-offers', user?.email, filter],
    queryFn: async () => {
      if (filter === 'alle') {
        return base44.entities.Offer.filter({ buyer_email: user.email }, '-created_date');
      }
      return base44.entities.Offer.filter({ 
        buyer_email: user.email, 
        status: filter 
      }, '-created_date');
    },
    enabled: !!user,
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Offer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buyer-offers']);
      toast.success('Angebot aktualisiert');
    },
  });

  const handleAcceptCounter = async (offer) => {
    updateOfferMutation.mutate({
      id: offer.id,
      data: { 
        status: 'angenommen',
        last_action_by: 'buyer'
      }
    });

    // Redirect to checkout with negotiated price
    toast.success(`Gegenvorschlag angenommen für ${offer.counter_price.toFixed(2)} €`);
  };

  const handleRejectCounter = (offer) => {
    updateOfferMutation.mutate({
      id: offer.id,
      data: { status: 'abgelehnt' }
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
          Meine Preisvorschläge
        </h1>
        <p className="text-[#6B8CA8]">Übersicht deiner Verhandlungen</p>
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
                const isExpired = new Date(offer.expires_at) < new Date();
                const showCounterActions = offer.status === 'gegenvorschlag' && offer.last_action_by === 'seller' && !isExpired;
                
                return (
                  <Card key={offer.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Link 
                          to={createPageUrl(`ProductDetail?id=${offer.product_id}`)}
                          className="w-20 h-20 rounded-lg overflow-hidden bg-[#EBF5FF] shrink-0 hover:opacity-80"
                        >
                          {offer.product_image && (
                            <img src={offer.product_image} alt="" className="w-full h-full object-cover" />
                          )}
                        </Link>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Link 
                                to={createPageUrl(`ProductDetail?id=${offer.product_id}`)}
                                className="font-medium text-[#2A4D66] hover:text-[#7AB8E8] mb-1 block"
                              >
                                {offer.product_title}
                              </Link>
                              <p className="text-sm text-[#6B8CA8]">
                                An: {offer.seller_email.split('@')[0]}
                              </p>
                            </div>
                            <Badge className={statusColors[isExpired ? 'abgelaufen' : offer.status]}>
                              {isExpired ? 'Abgelaufen' :
                               offer.status === 'offen' ? 'Warten auf Antwort' :
                               offer.status === 'gegenvorschlag' ? 'Neuer Gegenvorschlag!' :
                               offer.status === 'angenommen' ? 'Angenommen' : 'Abgelehnt'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-[#6B8CA8]">Original</p>
                              <p className="font-medium text-[#2A4D66]">{offer.original_price.toFixed(2)} €</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#6B8CA8]">Dein Angebot</p>
                              <p className="font-bold text-[#7AB8E8]">{offer.proposed_price.toFixed(2)} €</p>
                            </div>
                            {offer.counter_price && (
                              <div>
                                <p className="text-xs text-[#6B8CA8]">Gegenvorschlag</p>
                                <p className="font-bold text-blue-600">{offer.counter_price.toFixed(2)} €</p>
                              </div>
                            )}
                          </div>

                          {showCounterActions && (
                            <div className="flex gap-2 mb-3">
                              <Button
                                onClick={() => handleAcceptCounter(offer)}
                                className="flex-1 bg-green-500 hover:bg-green-600"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Für {offer.counter_price.toFixed(2)} € kaufen
                              </Button>
                              <Button
                                onClick={() => handleRejectCounter(offer)}
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                Ablehnen
                              </Button>
                            </div>
                          )}

                          <p className="text-xs text-[#6B8CA8]">
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