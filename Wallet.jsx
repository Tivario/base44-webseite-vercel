import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet as WalletIcon, TrendingUp, Clock, DollarSign, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    iban: '',
    bic: '',
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.bank_details) {
        setBankDetails(userData.bank_details);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: payouts } = useQuery({
    queryKey: ['payouts', user?.email],
    queryFn: () => base44.entities.Payout.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ['wallet-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ seller_email: user.email }, '-created_date', 20),
    enabled: !!user,
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Payout.create(data);
      // Update user balance
      await base44.auth.updateMe({
        balance: (user.balance || 0) - parseFloat(payoutAmount),
        bank_details: bankDetails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payouts']);
      toast.success('Auszahlung angefordert!');
      setShowPayoutDialog(false);
      setPayoutAmount('');
      loadUser();
    },
  });

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error('Bitte gib einen gültigen Betrag ein');
      return;
    }
    if (amount > (user.balance || 0)) {
      toast.error('Nicht genug Guthaben verfügbar');
      return;
    }
    if (!bankDetails.iban || !bankDetails.account_holder) {
      toast.error('Bitte fülle alle Bankdaten aus');
      return;
    }

    // KYC Check
    if (!user.kyc_verified) {
      toast.error('Verifizierung erforderlich. Bitte gehe zu Profil → KYC-Verifizierung');
      return;
    }

    try {
      await base44.entities.Payout.create({
        user_email: user.email,
        amount,
        bank_details: bankDetails,
        status: 'angefordert',
      });

      await base44.auth.updateMe({
        balance: (user.balance || 0) - amount,
        bank_details: bankDetails,
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: 'admin@tivario.com',
        subject: `Neue Auszahlungsanforderung - ${user.email}`,
        body: `Nutzer: ${user.email}\nBetrag: ${amount.toFixed(2)} €\nIBAN: ${bankDetails.iban}\nKontoinhaber: ${bankDetails.account_holder}`
      });

      toast.success('Auszahlung angefordert!');
      setShowPayoutDialog(false);
      setPayoutAmount('');
      loadUser();
    } catch (err) {
      toast.error('Fehler bei der Auszahlung');
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Wallet...</p>
      </div>
    );
  }

  const balance = user.balance || 0;
  const pendingBalance = user.pending_balance || 0;
  const totalEarnings = transactions?.reduce((sum, t) => sum + (t.net_amount || 0), 0) || 0;

  const statusColors = {
    angefordert: 'bg-yellow-100 text-yellow-800',
    in_bearbeitung: 'bg-blue-100 text-blue-800',
    ausgezahlt: 'bg-green-100 text-green-800',
    abgelehnt: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-[#2A4D66] to-[#7AB8E8] bg-clip-text text-transparent mb-2">
            Mein Wallet
          </h1>
          <p className="text-[#6B8CA8]">Verwalte dein Guthaben und fordere Auszahlungen an</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#6B8CA8] flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <WalletIcon className="w-4 h-4 text-white" />
                </div>
                Verfügbares Guthaben
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600">{balance.toFixed(2)} €</p>
              <p className="text-xs text-[#6B8CA8] mt-2">Kann ausgezahlt werden</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#6B8CA8] flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Offener Betrag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-600">{pendingBalance.toFixed(2)} €</p>
              <p className="text-xs text-[#6B8CA8] mt-2">Nach Zustellung verfügbar</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#6B8CA8] flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7AB8E8] to-[#A8D5F2] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Gesamteinnahmen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#7AB8E8]">{totalEarnings.toFixed(2)} €</p>
              <p className="text-xs text-[#6B8CA8] mt-2">Lifetime Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Button */}
        <div className="mb-8">
          <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
            <DialogTrigger asChild>
              <Button 
                disabled={balance < 10}
                className="bg-gradient-to-r from-[#7AB8E8] to-[#A8D5F2] hover:from-[#6BA7D8] hover:to-[#98C5E2] text-white h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Auszahlung anfordern
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Auszahlung anfordern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-[#2A4D66]">Betrag (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="10"
                  max={balance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Mindestens 10€"
                  className="mt-1.5 border-[#E0EEF8]"
                />
                <p className="text-xs text-[#6B8CA8] mt-1">
                  Verfügbar: {balance.toFixed(2)} €
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-[#2A4D66]">Bankverbindung</Label>
                <Input
                  value={bankDetails.account_holder}
                  onChange={(e) => setBankDetails({...bankDetails, account_holder: e.target.value})}
                  placeholder="Kontoinhaber"
                  className="border-[#E0EEF8]"
                />
                <Input
                  value={bankDetails.iban}
                  onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                  placeholder="IBAN"
                  className="border-[#E0EEF8]"
                />
                <Input
                  value={bankDetails.bic}
                  onChange={(e) => setBankDetails({...bankDetails, bic: e.target.value})}
                  placeholder="BIC (optional)"
                  className="border-[#E0EEF8]"
                />
              </div>

              <Button
                onClick={handleRequestPayout}
                disabled={requestPayoutMutation.isPending}
                className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]"
              >
                {requestPayoutMutation.isPending ? 'Wird gesendet...' : 'Auszahlung anfordern'}
              </Button>

              <p className="text-xs text-[#6B8CA8] text-center">
                Auszahlungen werden innerhalb von 3-5 Werktagen bearbeitet
              </p>
            </div>
          </DialogContent>
        </Dialog>
        {balance < 10 && (
          <p className="text-sm text-[#6B8CA8] mt-2">
            Mindestbetrag für Auszahlungen: 10€
          </p>
        )}
      </div>

        {/* Payout History */}
        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4D66]">Auszahlungshistorie</CardTitle>
          </CardHeader>
          <CardContent>
            {!payouts || payouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#A8D5F2] to-[#7AB8E8] flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#6B8CA8]">Noch keine Auszahlungen angefordert</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-5 bg-gradient-to-br from-[#F8FBFF] to-white rounded-2xl border border-[#E0EEF8] hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7AB8E8] to-[#A8D5F2] flex items-center justify-center shadow-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#2A4D66] text-lg">{payout.amount.toFixed(2)} €</p>
                        <p className="text-sm text-[#6B8CA8]">
                          {new Date(payout.created_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[payout.status]}>
                      {payout.status === 'angefordert' ? 'Angefordert' :
                       payout.status === 'in_bearbeitung' ? 'In Bearbeitung' :
                       payout.status === 'ausgezahlt' ? 'Ausgezahlt' : 'Abgelehnt'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}