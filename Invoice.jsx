import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Invoice() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id');
  
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

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const txs = await base44.entities.Transaction.filter({ id: transactionId });
      return txs[0];
    },
    enabled: !!transactionId && !!user,
  });

  const downloadInvoice = () => {
    if (!transaction) return;

    const invoiceText = `
RECHNUNG

Rechnungsnummer: #${transaction.id}
Rechnungsdatum: ${new Date(transaction.created_date).toLocaleDateString('de-DE')}

Von:
Tivario GmbH
Musterstraße 123
12345 Musterstadt
USt-ID: DE123456789

An:
${user.full_name || user.email}

Artikel: ${transaction.product_title}
Artikelpreis: ${transaction.item_price?.toFixed(2)} €
Versand: ${transaction.shipping_price?.toFixed(2)} €
Käuferschutzgebühr: ${transaction.buyer_protection_fee?.toFixed(2)} €

Gesamtbetrag: ${transaction.total_price?.toFixed(2)} €

Enthaltene MwSt. (19%): ${(transaction.total_price * 0.19 / 1.19).toFixed(2)} €

Zahlungsmethode: Online-Zahlung
Status: Bezahlt

Vielen Dank für Ihren Einkauf bei Tivario!
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rechnung-${transaction.id}.txt`;
    link.click();
    toast.success('Rechnung heruntergeladen');
  };

  if (!transaction) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card className="bg-white border-[#E0EEF8] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Rechnung #{transaction.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[#6B8CA8] mb-1">Von:</p>
              <p className="font-medium text-[#2A4D66]">Tivario GmbH</p>
              <p className="text-sm text-[#6B8CA8]">Musterstraße 123</p>
              <p className="text-sm text-[#6B8CA8]">12345 Musterstadt</p>
            </div>
            <div>
              <p className="text-sm text-[#6B8CA8] mb-1">An:</p>
              <p className="font-medium text-[#2A4D66]">{user?.full_name || user?.email}</p>
              <p className="text-sm text-[#6B8CA8]">
                Datum: {new Date(transaction.created_date).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>

          <div className="border-t border-[#E0EEF8] pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6B8CA8]">Artikel</span>
                <span className="font-medium text-[#2A4D66]">{transaction.product_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B8CA8]">Artikelpreis</span>
                <span className="text-[#2A4D66]">{transaction.item_price?.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B8CA8]">Versand</span>
                <span className="text-[#2A4D66]">{transaction.shipping_price?.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B8CA8]">Käuferschutzgebühr</span>
                <span className="text-[#2A4D66]">{transaction.buyer_protection_fee?.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E0EEF8]">
                <span className="font-bold text-[#2A4D66]">Gesamtbetrag</span>
                <span className="font-bold text-[#2A4D66]">{transaction.total_price?.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B8CA8]">enthaltene MwSt. (19%)</span>
                <span className="text-[#6B8CA8]">{(transaction.total_price * 0.19 / 1.19).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <Button onClick={downloadInvoice} className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
            <Download className="w-4 h-4 mr-2" />
            Rechnung herunterladen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}