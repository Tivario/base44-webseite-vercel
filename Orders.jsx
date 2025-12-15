import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, ShoppingBag, Truck, CheckCircle2, Clock, 
  ExternalLink, Filter, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import ShippingManager from '../components/shipping/ShippingManager';

const statusLabels = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-800' },
  shipped: { label: 'Versendet', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Zugestellt', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Storniert', color: 'bg-red-100 text-red-800' }
};

export default function Orders() {
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

  const { data: sales, isLoading: loadingSales, refetch: refetchSales } = useQuery({
    queryKey: ['sales', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: purchases, isLoading: loadingPurchases } = useQuery({
    queryKey: ['purchases', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ buyer_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Bestellungen...</p>
      </div>
    );
  }

  const OrderCard = ({ transaction, isSeller }) => {
    const status = statusLabels[transaction.status] || statusLabels.pending;

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-[#EBF5FF] shrink-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-[#7AB8E8]" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#2A4D66] mb-1">
                    {transaction.product_title}
                  </h3>
                  <p className="text-sm text-[#6B8CA8]">
                    {isSeller ? `Käufer: ${transaction.buyer_email}` : `Verkäufer: ${transaction.seller_email}`}
                  </p>
                </div>
                <Badge className={status.color}>{status.label}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#6B8CA8] mb-3">
                <span>
                  {transaction.type === 'verkauf' ? `${transaction.amount?.toFixed(2)} €` : 'Tausch'}
                </span>
                <span>•</span>
                <span>{new Date(transaction.created_date).toLocaleDateString('de-DE')}</span>
              </div>

              {transaction.tracking_number && (
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-[#7AB8E8]" />
                  <span className="text-sm font-mono text-[#2A4D66]">
                    {transaction.tracking_number}
                  </span>
                  {transaction.tracking_url && (
                    <a
                      href={transaction.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7AB8E8] hover:text-[#6BB5E8]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {isSeller && transaction.status !== 'shipped' && transaction.status !== 'delivered' && (
                <Link to={createPageUrl(`OrderDetail?id=${transaction.id}`)}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Versand verwalten
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8">
        <Link to={createPageUrl('Profile')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Profil
          </Button>
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Meine Bestellungen
        </h1>
        <p className="text-[#6B8CA8]">Verwalte deine Käufe und Verkäufe</p>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="bg-[#EBF5FF] p-1 rounded-xl mb-6">
          <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-white gap-2">
            <ShoppingBag className="w-4 h-4" />
            Verkäufe ({sales?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-lg data-[state=active]:bg-white gap-2">
            <Package className="w-4 h-4" />
            Käufe ({purchases?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          {loadingSales ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-32" />
              ))}
            </div>
          ) : sales?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E0EEF8]">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#6B8CA8]" />
              <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Keine Verkäufe</h3>
              <p className="text-[#6B8CA8]">Deine Verkäufe erscheinen hier</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <OrderCard transaction={transaction} isSeller={true} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          {loadingPurchases ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-32" />
              ))}
            </div>
          ) : purchases?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E0EEF8]">
              <Package className="w-16 h-16 mx-auto mb-4 text-[#6B8CA8]" />
              <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Keine Käufe</h3>
              <p className="text-[#6B8CA8]">Deine Käufe erscheinen hier</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <OrderCard transaction={transaction} isSeller={false} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}