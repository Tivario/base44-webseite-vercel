import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Widerruf() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    orderNumber: '',
    orderDate: '',
    productTitle: '',
  });

  const downloadForm = () => {
    const text = `
WIDERRUFSFORMULAR

An:
Tivario GmbH
Musterstraße 123
12345 Musterstadt
E-Mail: widerruf@tivario.com

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)

Bestellt am (*) / erhalten am (*): ${formData.orderDate || '_____________'}
Bestellnummer: ${formData.orderNumber || '_____________'}
Artikel: ${formData.productTitle || '_____________'}

Name des/der Verbraucher(s): ${formData.name || '_____________'}
Anschrift des/der Verbraucher(s): ${formData.address || '_____________'}
E-Mail: ${formData.email || '_____________'}

Datum: ${new Date().toLocaleDateString('de-DE')}

Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _____________

(*) Unzutreffendes streichen.
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Widerrufsformular-Tivario.txt';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Legal')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Rechtsinformationen
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Widerrufsrecht & Widerrufsformular
        </h1>
        <p className="text-[#6B8CA8] mb-8">Informationen zu deinem gesetzlichen Widerrufsrecht</p>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-[#2A4D66]">Widerrufsbelehrung</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
            <h3>Widerrufsrecht</h3>
            <p>
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
            </p>
            <p>
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, 
              der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
            </p>
            <p>
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Tivario GmbH, Musterstraße 123, 12345 Musterstadt, 
              E-Mail: widerruf@tivario.com) mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter 
              Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
            </p>
            <p>
              Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
            </p>

            <h3>Folgen des Widerrufs</h3>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, 
              einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass 
              Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), 
              unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über 
              Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
            <p>
              Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
            </p>

            <h3>Ausschluss des Widerrufsrechts</h3>
            <p>
              Das Widerrufsrecht besteht nicht bei Waren, die schnell verderben können oder deren Verfallsdatum 
              schnell überschritten würde, sowie bei versiegelten Waren, die aus Gründen des Gesundheitsschutzes 
              oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
              <FileText className="w-5 h-5" />
              Muster-Widerrufsformular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#6B8CA8]">
              Füllen Sie dieses Formular aus und senden Sie es per E-Mail an widerruf@tivario.com oder 
              laden Sie es herunter und senden Sie es per Post.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#2A4D66] mb-1 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ihr vollständiger Name"
                  className="border-[#E0EEF8]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2A4D66] mb-1 block">Anschrift</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Straße, Hausnummer, PLZ, Ort"
                  className="border-[#E0EEF8] h-20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2A4D66] mb-1 block">E-Mail</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ihre.email@beispiel.de"
                  className="border-[#E0EEF8]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2A4D66] mb-1 block">Bestellnummer</label>
                <Input
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  placeholder="z.B. #12345"
                  className="border-[#E0EEF8]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2A4D66] mb-1 block">Bestelldatum</label>
                <Input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="border-[#E0EEF8]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#2A4D66] mb-1 block">Artikelbezeichnung</label>
                <Input
                  value={formData.productTitle}
                  onChange={(e) => setFormData({ ...formData, productTitle: e.target.value })}
                  placeholder="Name des gekauften Artikels"
                  className="border-[#E0EEF8]"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                onClick={downloadForm}
                className="bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Formular herunterladen
              </Button>
              <Button
                variant="outline"
                className="border-[#E0EEF8]"
                onClick={() => {
                  window.location.href = `mailto:widerruf@tivario.com?subject=Widerruf Bestellung ${formData.orderNumber}&body=Hiermit widerrufe ich den Kauf vom ${formData.orderDate}. Bestellnummer: ${formData.orderNumber}`;
                }}
              >
                Per E-Mail senden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}