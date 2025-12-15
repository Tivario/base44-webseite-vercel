import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function TaxReport() {
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());

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

  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.email, year],
    queryFn: async () => {
      const allTransactions = await base44.entities.Transaction.filter({
        seller_email: user.email,
        status: { $in: ['completed', 'delivered'] }
      });
      return allTransactions.filter(t => {
        const txYear = new Date(t.created_date).getFullYear();
        return txYear === parseInt(year);
      });
    },
    enabled: !!user,
  });

  const downloadReport = () => {
    if (!transactions?.length) {
      toast.error('Keine Transaktionen für dieses Jahr');
      return;
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.seller_payout || 0), 0);
    const totalFees = transactions.reduce((sum, t) => sum + (t.platform_fee || 0), 0);
    const totalProfit = transactions.reduce((sum, t) => {
      const payout = t.seller_payout || 0;
      const original = t.original_price || 0;
      return sum + (payout - original);
    }, 0);

    const csv = [
      ['Datum', 'Artikel', 'Verkaufspreis (brutto)', 'Plattform-Gebühr', 'Auszahlung (netto)', 'Einkaufspreis', 'Gewinn', 'Käufer'].join(';'),
      ...transactions.map(t => [
        new Date(t.created_date).toLocaleDateString('de-DE'),
        t.product_title,
        t.item_price?.toFixed(2) || '0.00',
        t.platform_fee?.toFixed(2) || '0.00',
        t.seller_payout?.toFixed(2) || '0.00',
        t.original_price?.toFixed(2) || '0.00',
        ((t.seller_payout || 0) - (t.original_price || 0)).toFixed(2),
        t.buyer_email
      ].join(';')),
      [],
      ['GESAMT', '', '', totalFees.toFixed(2), totalRevenue.toFixed(2), '', totalProfit.toFixed(2), ''].join(';')
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Steuer-Report-${year}.csv`;
    link.click();

    toast.success('Report heruntergeladen');
  };

  if (!user) return <div className="p-8">Lädt...</div>;

  const totalRevenue = transactions?.reduce((sum, t) => sum + (t.seller_payout || 0), 0) || 0;
  const totalFees = transactions?.reduce((sum, t) => sum + (t.platform_fee || 0), 0) || 0;
  const totalProfit = transactions?.reduce((sum, t) => {
    const payout = t.seller_payout || 0;
    const original = t.original_price || 0;
    return sum + (payout - original);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
            Steuer-Report
          </h1>
          <p className="text-[#6B8CA8]">Jahresübersicht für deine Steuererklärung</p>
        </div>

        <div className="mb-6">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2023, 2022, 2021].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-[#E0EEF8] shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-[#6B8CA8] mb-1">Gesamtumsatz</p>
              <p className="text-3xl font-bold text-[#2A4D66]">{totalRevenue.toFixed(2)} €</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E0EEF8] shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-[#6B8CA8] mb-1">Plattform-Gebühren</p>
              <p className="text-3xl font-bold text-red-600">-{totalFees.toFixed(2)} €</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E0EEF8] shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-[#6B8CA8] mb-1">Gewinn</p>
              <p className="text-3xl font-bold text-green-600">{totalProfit.toFixed(2)} €</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle>Transaktionen {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {transactions?.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-[#F8FBFF] rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-[#2A4D66]">{tx.product_title}</p>
                    <p className="text-sm text-[#6B8CA8]">
                      {new Date(tx.created_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2A4D66]">{tx.seller_payout?.toFixed(2)} €</p>
                    <p className="text-xs text-[#6B8CA8]">Gebühr: -{tx.platform_fee?.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={downloadReport} className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
              <Download className="w-4 h-4 mr-2" />
              Als CSV für Steuerberater herunterladen
            </Button>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Hinweis:</strong> Diese Übersicht dient nur zur Information. 
                Konsultiere einen Steuerberater für die korrekte Steuererklärung.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}