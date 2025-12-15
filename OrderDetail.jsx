import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { differenceInDays } from 'date-fns';
import ShippingManager from '../components/shipping/ShippingManager';
import ReviewForm from '../components/reviews/ReviewForm';
import DisputeForm from '../components/disputes/DisputeForm';

export default function OrderDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

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

  const { data: transaction, isLoading, refetch } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const transactions = await base44.entities.Transaction.filter({ id: transactionId });
      return transactions[0];
    },
    enabled: !!transactionId,
  });

  const { data: existingReview } = useQuery({
    queryKey: ['review', transactionId],
    queryFn: () => base44.entities.Review.filter({ transaction_id: transactionId }),
    enabled: !!transactionId,
  });

  const { data: disputes, refetch: refetchDisputes } = useQuery({
    queryKey: ['disputes', transactionId],
    queryFn: () => base44.entities.Dispute.filter({ transaction_id: transactionId }),
    enabled: !!transactionId,
  });

  const isBuyer = user?.email === transaction?.buyer_email;
  const shippingOverdue = transaction && !transaction.shipped_at && transaction.shipping_deadline
    ? new Date() > new Date(transaction.shipping_deadline)
    : false;

  const daysUntilShippingDeadline = transaction?.shipping_deadline && !transaction.shipped_at
    ? differenceInDays(new Date(transaction.shipping_deadline), new Date())
    : null;

  const canFileDispute = transaction?.delivered_at && transaction.dispute_deadline
    ? new Date() < new Date(transaction.dispute_deadline)
    : false;

  const existingDispute = disputes && disputes.length > 0 ? disputes[0] : null;

  if (isLoading || !transaction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Bestelldetails...</p>
      </div>
    );
  }

  const isSeller = user?.email === transaction.seller_email;
  const canReview = !isSeller && transaction.status === 'delivered' && (!existingReview || existingReview.length === 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link to={createPageUrl('Orders')}>
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Bestellungen
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Shipping Deadline Warning */}
        {isSeller && daysUntilShippingDeadline !== null && daysUntilShippingDeadline >= 0 && !transaction.shipped_at && (
          <Alert className={`${daysUntilShippingDeadline <= 1 ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'}`}>
            <Clock className={`w-5 h-5 ${daysUntilShippingDeadline <= 1 ? 'text-red-600' : 'text-orange-600'}`} />
            <AlertDescription>
              <p className={`font-semibold ${daysUntilShippingDeadline <= 1 ? 'text-red-900' : 'text-orange-900'}`}>
                ⏰ Versandfrist: Noch {daysUntilShippingDeadline} {daysUntilShippingDeadline === 1 ? 'Tag' : 'Tage'}
              </p>
              <p className={`text-sm ${daysUntilShippingDeadline <= 1 ? 'text-red-700' : 'text-orange-700'} mt-1`}>
                Du musst den Artikel innerhalb von 5 Werktagen versenden. Bitte trage unten die Tracking-Nummer ein.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {isSeller && shippingOverdue && (
          <Alert className="bg-red-50 border-red-300">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900">⚠️ Versandfrist überschritten!</p>
              <p className="text-sm text-red-700 mt-1">
                Die 5-Tage-Frist ist abgelaufen. Bitte versende den Artikel umgehend.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {existingDispute && (
          <Alert className="bg-orange-50 border-orange-300">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <AlertDescription>
              <p className="font-semibold text-orange-900">🚨 Reklamation eingereicht</p>
              <p className="text-sm text-orange-700 mt-1">
                Status: {existingDispute.status} | Grund: {existingDispute.reason}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bestelldetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#6B8CA8] mb-1">Produkt</p>
              <p className="font-semibold text-[#2A4D66]">{transaction.product_title}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#6B8CA8] mb-1">Bestellnummer</p>
                <p className="text-sm font-mono text-[#2A4D66]">
                  {transaction.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6B8CA8] mb-1">Datum</p>
                <p className="text-sm text-[#2A4D66]">
                  {new Date(transaction.created_date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-[#6B8CA8] mb-1">
                {isSeller ? 'Käufer' : 'Verkäufer'}
              </p>
              <p className="text-sm text-[#2A4D66]">
                {isSeller ? transaction.buyer_email : transaction.seller_email}
              </p>
            </div>

            {transaction.type === 'verkauf' && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-[#6B8CA8] mb-1">Betrag</p>
                  <p className="text-2xl font-bold text-[#2A4D66]">
                    {transaction.amount?.toFixed(2)} €
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping */}
        {isSeller && (
          <ShippingManager transaction={transaction} onUpdate={refetch} />
        )}

        {/* Buyer: File Dispute */}
        {isBuyer && canFileDispute && !existingDispute && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Käuferschutz
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showDisputeForm ? (
                <div className="space-y-3">
                  <Alert className="bg-blue-50 border-blue-300">
                    <AlertDescription className="text-sm text-[#2A4D66]">
                      <strong>Schutz bei gefälschten Produkten:</strong> Sollte der Artikel gefälscht oder stark abweichend sein, kannst du innerhalb von 2 Tagen ein Problem melden. Bei bestätigter Fälschung erhältst du den vollen Kaufpreis zurück und darfst das Produkt behalten.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => setShowDisputeForm(true)}
                    variant="outline"
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    Problem melden
                  </Button>
                </div>
              ) : (
                <DisputeForm
                  transaction={transaction}
                  onSubmitted={() => {
                    setShowDisputeForm(false);
                    refetchDisputes();
                  }}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Buyer View - Tracking */}
        {!isSeller && transaction.tracking_number && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sendungsverfolgung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#6B8CA8] mb-1">Sendungsnummer</p>
                  <p className="font-mono text-[#2A4D66]">{transaction.tracking_number}</p>
                </div>
                {transaction.tracking_url && (
                  <a
                    href={transaction.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                      Sendung verfolgen
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}