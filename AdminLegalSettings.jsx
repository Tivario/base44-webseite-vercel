import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLegalSettings({ user }) {
  const [saving, setSaving] = useState(false);
  const [legalData, setLegalData] = useState({
    company_name: '',
    legal_form: '',
    address_street: '',
    address_postal: '',
    address_city: '',
    address_country: 'Deutschland',
    vat_id: '',
    register_court: '',
    register_number: '',
    ceo_name: '',
    contact_email: '',
    contact_phone: '',
    agb_content: `Allgemeine Geschäftsbedingungen (AGB)

§ 1 Geltungsbereich
(1) Für die über diesen Online-Shop begründeten Rechtsbeziehungen zwischen dem Betreiber des Shops (nachfolgend „Anbieter") und seinen Kunden gelten ausschließlich die folgenden Allgemeinen Geschäftsbedingungen in der jeweiligen Fassung zum Zeitpunkt der Bestellung.
(2) Abweichende Allgemeine Geschäftsbedingungen des Kunden werden zurückgewiesen.

§ 2 Vertragsschluss
(1) Die Präsentation der Waren im Internet-Shop stellt kein bindendes Angebot des Anbieters auf Abschluss eines Kaufvertrages dar. Der Kunde wird hierdurch lediglich aufgefordert, durch eine Bestellung ein Angebot abzugeben.
(2) Durch das Absenden der Bestellung im Internet-Shop gibt der Kunde ein verbindliches Angebot gerichtet auf den Abschluss eines Kaufvertrages über die im Warenkorb enthaltenen Waren ab.
(3) Der Anbieter bestätigt den Eingang der Bestellung des Kunden durch Versendung einer Bestätigungs-E-Mail.

§ 3 Eigentumsvorbehalt
Die gelieferte Ware verbleibt bis zur vollständigen Bezahlung im Eigentum des Anbieters.

§ 4 Fälligkeit
Die Zahlung des Kaufpreises ist mit Vertragsschluss fällig.

§ 5 Gewährleistung
(1) Es bestehen die gesetzlichen Mängelhaftungsrechte.
(2) Soweit der Kunde Verbraucher ist, beträgt die Verjährungsfrist für Mängelansprüche bei gebrauchten Sachen ein Jahr ab Ablieferung dieser Ware an den Kunden.

§ 6 Haftungsausschluss
(1) Schadensersatzansprüche des Kunden sind ausgeschlossen, soweit nachfolgend nichts anderes bestimmt ist.
(2) Von dem Haftungsausschluss ausgenommen sind Schadensersatzansprüche aufgrund einer Verletzung des Lebens, des Körpers, der Gesundheit und Schadensersatzansprüche aus der Verletzung wesentlicher Vertragspflichten.

§ 7 Streitbeilegung
Die EU-Kommission hat eine Internetplattform zur Online-Beilegung von Streitigkeiten geschaffen. Die Plattform dient als Anlaufstelle zur außergerichtlichen Beilegung von Streitigkeiten betreffend vertragliche Verpflichtungen, die aus Online-Kaufverträgen erwachsen. Nähere Informationen sind unter dem folgenden Link verfügbar: http://ec.europa.eu/consumers/odr`,

    privacy_content: `Datenschutzerklärung

Stand: ${new Date().toLocaleDateString('de-DE')}

1. Name und Kontaktdaten des Verantwortlichen
Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:
[Siehe Impressum]

2. Allgemeine Hinweise zur Datenverarbeitung
Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Plattform sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage der EU-Datenschutz-Grundverordnung (DSGVO).

3. Rechtsgrundlagen der Verarbeitung
Die Verarbeitung erfolgt auf Basis folgender Rechtsgrundlagen:
- Art. 6 Abs. 1 lit. b DSGVO: Vertragserfüllung und vorvertragliche Maßnahmen
- Art. 6 Abs. 1 lit. c DSGVO: Erfüllung rechtlicher Verpflichtungen
- Art. 6 Abs. 1 lit. f DSGVO: Berechtigte Interessen (Betrugsprävention, Systemsicherheit)
- Art. 6 Abs. 1 lit. a DSGVO: Einwilligung (Newsletter, Marketing)

4. Registrierung und Nutzerkonto
Bei der Registrierung verarbeiten wir folgende Daten:
- E-Mail-Adresse (Pflicht)
- Name (Pflicht)
- Passwort (verschlüsselt gespeichert)
- Profilbild (optional)
Die Daten werden für die Bereitstellung und Verwaltung Ihres Nutzerkontos benötigt.

5. Transaktionsdaten
Bei Käufen/Verkäufen verarbeiten wir:
- Lieferadresse
- Transaktionsdetails (Artikel, Preis, Datum)
- Kommunikation zwischen Käufer und Verkäufer
Diese Daten werden zur Vertragsabwicklung und für gesetzliche Aufbewahrungspflichten (10 Jahre nach HGB) gespeichert.

6. Zahlungsabwicklung
Die Zahlungsabwicklung erfolgt über:
- Stripe Inc., 510 Townsend Street, San Francisco, CA 94103, USA
- PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg
Tivario speichert keine Kreditkartendaten oder Bankverbindungen. Die Zahlungsdienstleister verarbeiten Ihre Daten nach PCI-DSS Standards und eigenen Datenschutzerklärungen.`,

    widerruf_content: `Widerrufsbelehrung für Verbraucher

WICHTIGER HINWEIS:
Das Widerrufsrecht gilt nur bei Käufen von gewerblichen Verkäufern. Bei Käufen von privaten Verkäufern besteht kein gesetzliches Widerrufsrecht!

Widerrufsrecht bei gewerblichen Verkäufern:

Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.

Um Ihr Widerrufsrecht auszuüben, müssen Sie den jeweiligen Verkäufer (Kontaktdaten finden Sie in der Transaktionsbestätigung) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.

Bei Widerruf kontaktieren Sie bitte auch den Tivario-Support unter support@tivario.com, damit wir die Rückabwicklung über unsere Plattform koordinieren können.`
  });

  useEffect(() => {
    if (user?.platform_legal_data) {
      setLegalData(user.platform_legal_data);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ platform_legal_data: legalData });
      toast.success('Rechtsdaten gespeichert');
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-xl">
        <AlertTriangle className="w-5 h-5" />
        <p className="text-sm">Diese Daten werden im Impressum angezeigt. Pflichtangaben nach § 5 TMG.</p>
      </div>

      <Card className="bg-white border-[#E0EEF8]">
        <CardHeader>
          <CardTitle>Impressum & Rechtsdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Firmenname *</Label>
              <Input
                value={legalData.company_name}
                onChange={(e) => setLegalData({ ...legalData, company_name: e.target.value })}
                placeholder="z.B. Tivario GmbH"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Rechtsform</Label>
              <Input
                value={legalData.legal_form}
                onChange={(e) => setLegalData({ ...legalData, legal_form: e.target.value })}
                placeholder="z.B. GmbH"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Straße & Hausnummer *</Label>
            <Input
              value={legalData.address_street}
              onChange={(e) => setLegalData({ ...legalData, address_street: e.target.value })}
              placeholder="Musterstraße 123"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>PLZ *</Label>
              <Input
                value={legalData.address_postal}
                onChange={(e) => setLegalData({ ...legalData, address_postal: e.target.value })}
                placeholder="10115"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Stadt *</Label>
              <Input
                value={legalData.address_city}
                onChange={(e) => setLegalData({ ...legalData, address_city: e.target.value })}
                placeholder="Berlin"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Land *</Label>
              <Input
                value={legalData.address_country}
                onChange={(e) => setLegalData({ ...legalData, address_country: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Geschäftsführer/Inhaber *</Label>
              <Input
                value={legalData.ceo_name}
                onChange={(e) => setLegalData({ ...legalData, ceo_name: e.target.value })}
                placeholder="Max Mustermann"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>USt-ID</Label>
              <Input
                value={legalData.vat_id}
                onChange={(e) => setLegalData({ ...legalData, vat_id: e.target.value })}
                placeholder="DE123456789"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Registergericht</Label>
              <Input
                value={legalData.register_court}
                onChange={(e) => setLegalData({ ...legalData, register_court: e.target.value })}
                placeholder="Amtsgericht Berlin"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Registernummer</Label>
              <Input
                value={legalData.register_number}
                onChange={(e) => setLegalData({ ...legalData, register_number: e.target.value })}
                placeholder="HRB 12345"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kontakt E-Mail *</Label>
              <Input
                type="email"
                value={legalData.contact_email}
                onChange={(e) => setLegalData({ ...legalData, contact_email: e.target.value })}
                placeholder="info@tivario.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={legalData.contact_phone}
                onChange={(e) => setLegalData({ ...legalData, contact_phone: e.target.value })}
                placeholder="+49 30 12345678"
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E0EEF8]">
        <CardHeader>
          <CardTitle>AGB (Allgemeine Geschäftsbedingungen)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={legalData.agb_content || ''}
            onChange={(e) => setLegalData({ ...legalData, agb_content: e.target.value })}
            placeholder="Füge hier die AGB ein..."
            rows={12}
          />
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E0EEF8]">
        <CardHeader>
          <CardTitle>Datenschutzerklärung</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={legalData.privacy_content || ''}
            onChange={(e) => setLegalData({ ...legalData, privacy_content: e.target.value })}
            placeholder="Füge hier die Datenschutzerklärung ein..."
            rows={12}
          />
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E0EEF8]">
        <CardHeader>
          <CardTitle>Widerrufsbelehrung</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={legalData.widerruf_content || ''}
            onChange={(e) => setLegalData({ ...legalData, widerruf_content: e.target.value })}
            placeholder="Füge hier die Widerrufsbelehrung ein..."
            rows={8}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Speichert...' : 'Speichern'}
      </Button>
    </div>
  );
}