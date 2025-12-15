import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLegal() {
  const [user, setUser] = useState(null);
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
(1) Für die über diesen Online-Shop begründeten Rechtsbeziehungen zwischen dem Betreiber des Shops (nachfolgend „Anbieter“) und seinen Kunden gelten ausschließlich die folgenden Allgemeinen Geschäftsbedingungen in der jeweiligen Fassung zum Zeitpunkt der Bestellung.
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
Tivario speichert keine Kreditkartendaten oder Bankverbindungen. Die Zahlungsdienstleister verarbeiten Ihre Daten nach PCI-DSS Standards und eigenen Datenschutzerklärungen.

7. Versanddienstleister
Zur Versandabwicklung übermitteln wir Lieferdaten an:
- DHL Paket GmbH, Sträßchensweg 10, 53113 Bonn
- DPD Deutschland GmbH, Wailandtstraße 1, 63741 Aschaffenburg
- Hermes Germany GmbH, Essener Bogen 15, 22419 Hamburg
Die Versanddienstleister verarbeiten Ihre Daten gemäß eigener Datenschutzbestimmungen.

8. Cookies und Tracking
Wir verwenden:
- Technisch notwendige Cookies: Session-Verwaltung, Warenkorb (ohne Einwilligung)
- Analyse-Cookies: Zur Verbesserung der Plattform (mit Einwilligung)
Sie können Cookies in Ihren Browsereinstellungen verwalten und löschen.

9. Server-Log-Dateien
Unser Hosting-Provider speichert automatisch:
- IP-Adresse
- Browser-Typ und Version
- Betriebssystem
- Zugriffsdatum und Uhrzeit
Diese Daten werden nach 7 Tagen gelöscht und dienen der Systemsicherheit.

10. E-Mail-Kommunikation
Wir senden E-Mails für:
- Transaktionsbestätigungen (Rechtsgrundlage: Vertragserfüllung)
- Versandbenachrichtigungen (Rechtsgrundlage: Vertragserfüllung)
- Systembenachrichtigungen (Rechtsgrundlage: berechtigtes Interesse)
- Newsletter (nur mit Einwilligung, jederzeit widerrufbar)

11. Datenweitergabe
Wir geben Ihre Daten weiter an:
- Transaktionspartner (Käufer/Verkäufer): Name, Adresse, E-Mail zur Vertragsabwicklung
- Zahlungsdienstleister: Transaktionsdaten zur Zahlungsabwicklung
- Versanddienstleister: Lieferadresse zur Zustellung
- Behörden: Bei rechtlicher Verpflichtung
Eine darüber hinausgehende Weitergabe erfolgt nicht.

12. Drittlandübermittlung
Bei Nutzung von Stripe (USA) erfolgt eine Übermittlung in ein Drittland. Stripe ist nach dem EU-US Data Privacy Framework zertifiziert und bietet ein angemessenes Datenschutzniveau.

13. Speicherdauer
- Nutzerkonto-Daten: Bis zur Löschung des Kontos
- Transaktionsdaten: 10 Jahre (gesetzliche Aufbewahrungspflicht nach HGB)
- Kommunikation: 3 Jahre nach Transaktionsabschluss
- Log-Dateien: 7 Tage

14. Ihre Rechte als Betroffener
Sie haben das Recht auf:
- Auskunft (Art. 15 DSGVO)
- Berichtigung (Art. 16 DSGVO)
- Löschung (Art. 17 DSGVO)
- Einschränkung der Verarbeitung (Art. 18 DSGVO)
- Datenübertragbarkeit (Art. 20 DSGVO)
- Widerspruch (Art. 21 DSGVO)
- Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)
- Beschwerde bei Aufsichtsbehörde (Art. 77 DSGVO)

Kontakt für Datenschutzanfragen: datenschutz@tivario.com

15. Datensicherheit
Wir verwenden SSL/TLS-Verschlüsselung für die Datenübertragung und treffen technische und organisatorische Maßnahmen zum Schutz Ihrer Daten vor unbefugtem Zugriff, Verlust oder Manipulation.

16. Automatisierte Entscheidungsfindung
Wir setzen keine automatisierte Entscheidungsfindung oder Profiling im Sinne von Art. 22 DSGVO ein.

17. Änderungen dieser Datenschutzerklärung
Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets auf der Plattform abrufbar.`,

    widerruf_content: `Widerrufsbelehrung für Verbraucher

WICHTIGER HINWEIS:
Das Widerrufsrecht gilt nur bei Käufen von gewerblichen Verkäufern. Bei Käufen von privaten Verkäufern besteht kein gesetzliches Widerrufsrecht!

Widerrufsrecht bei gewerblichen Verkäufern:

Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.

Um Ihr Widerrufsrecht auszuüben, müssen Sie den jeweiligen Verkäufer (Kontaktdaten finden Sie in der Transaktionsbestätigung) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.

Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

Folgen des Widerrufs:

Wenn Sie diesen Vertrag widerrufen, hat der Verkäufer Ihnen alle Zahlungen, die er von Ihnen erhalten hat, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die vom Verkäufer angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags beim Verkäufer eingegangen ist.

Für diese Rückzahlung verwendet der Verkäufer dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.

Der Verkäufer kann die Rückzahlung verweigern, bis er die Waren wieder zurückerhalten hat oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.

Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie den Verkäufer über den Widerruf dieses Vertrags unterrichten, an den Verkäufer zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.

Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.

Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.

Ausschluss bzw. vorzeitiges Erlöschen des Widerrufsrechts:

Das Widerrufsrecht besteht nicht bei Verträgen über:
- Waren, die nach Kundenspezifikation angefertigt wurden oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind
- Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde
- versiegelte Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde

Besonderheiten bei Second-Hand-Artikeln:

Da es sich bei den auf Tivario angebotenen Artikeln um gebrauchte Waren handelt, bitten wir Sie zu beachten:
- Prüfen Sie die Ware bei Erhalt sorgfältig
- Tragen Sie die Ware nicht und entfernen Sie keine Originaletikett bei gewerblichen Verkäufern
- Dokumentieren Sie eventuelle Mängel umgehend mit Fotos
- Bei privaten Verkäufern besteht kein Widerrufsrecht, nutzen Sie den Tivario-Käuferschutz bei erheblichen Abweichungen

Muster-Widerrufsformular:

(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)

An:
[Name des gewerblichen Verkäufers]
[Anschrift des Verkäufers]
[E-Mail-Adresse des Verkäufers]

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):

Artikel: ____________________
Bestellnummer/Transaktions-ID: ____________________
Bestellt am: ____________________
Erhalten am: ____________________

Name des/der Verbraucher(s): ____________________
Anschrift des/der Verbraucher(s): ____________________

Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________________

Datum: ____________________

(*) Unzutreffendes streichen.

Hinweis zur Abwicklung über Tivario:
Bei Widerruf kontaktieren Sie bitte auch den Tivario-Support unter support@tivario.com, damit wir die Rückabwicklung über unsere Plattform koordinieren können.`
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(userData);
      if (userData.platform_legal_data) {
        setLegalData(userData.platform_legal_data);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

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

  if (!user) return <div className="p-8">Lädt...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
            Rechtliche Pflichtangaben (Impressum)
          </h1>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">Diese Daten werden im Impressum angezeigt. Pflichtangaben nach § 5 TMG.</p>
          </div>
        </div>

        <Card className="bg-white border-[#E0EEF8] shadow-lg mb-6">
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

        <Card className="bg-white border-[#E0EEF8] shadow-lg mb-6">
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

        <Card className="bg-white border-[#E0EEF8] shadow-lg mb-6">
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

        <Card className="bg-white border-[#E0EEF8] shadow-lg mb-6">
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
    </div>
  );
}