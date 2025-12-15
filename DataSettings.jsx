import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataSettings({ user }) {
  const [exporting, setExporting] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Daten abrufen
      const [products, transactions, favorites, conversations] = await Promise.all([
        base44.entities.Product.filter({ seller_email: user.email }),
        base44.entities.Transaction.filter({ seller_email: user.email }),
        base44.entities.Favorite.filter({ user_email: user.email }),
        base44.entities.Conversation.filter({
          $or: [{ seller_email: user.email }, { buyer_email: user.email }]
        })
      ]);

      // Daten zusammenstellen
      const exportData = {
        user: {
          email: user.email,
          full_name: user.full_name,
          display_name: user.display_name,
          bio: user.bio,
          city: user.city,
          country: user.country,
        },
        products: products,
        transactions: transactions,
        favorites: favorites,
        conversations: conversations,
        export_date: new Date().toISOString(),
      };

      // Als JSON herunterladen
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tivaro-daten-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setExportRequested(true);
      toast.success('Daten erfolgreich exportiert');
    } catch (err) {
      toast.error('Fehler beim Export');
    }
    setExporting(false);
  };

  return (
    <Card className="border-[#E0EEF8]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
          <FileText className="w-5 h-5" />
          Daten-Export
        </CardTitle>
        <CardDescription>
          Exportiere eine Kopie deiner persönlichen Daten
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-[#EBF5FF] rounded-xl">
          <h4 className="font-medium text-[#2A4D66] mb-2">Was wird exportiert?</h4>
          <ul className="text-sm text-[#6B8CA8] space-y-1 list-disc list-inside">
            <li>Profildaten (Name, E-Mail, Bio, etc.)</li>
            <li>Deine Artikel und Angebote</li>
            <li>Bestellungen und Verkäufe</li>
            <li>Favoriten</li>
            <li>Konversationen (Metadaten)</li>
          </ul>
        </div>

        {exportRequested && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Export erfolgreich heruntergeladen
              </p>
              <p className="text-xs text-green-700">
                Deine Daten wurden als JSON-Datei gespeichert
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#E0EEF8]">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportiere Daten...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Daten jetzt exportieren
              </>
            )}
          </Button>
          <p className="text-xs text-[#6B8CA8] text-center mt-3">
            Der Export startet sofort. Die Datei wird als JSON heruntergeladen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}