import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Shield, Lock, CreditCard, Check, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSecurity() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Legal')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Rechtsinformationen
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Zahlungssicherheit
        </h1>
        <p className="text-[#6B8CA8] mb-8">So schützen wir deine Zahlungen</p>

        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">SSL-Verschlüsselung</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <p>
                Alle Zahlungsvorgänge auf Tivario sind durch modernste SSL/TLS-Verschlüsselung (256-Bit) geschützt.
                Deine Zahlungsdaten werden niemals unverschlüsselt übertragen.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Automatische HTTPS-Verbindung</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Zertifizierte Verschlüsselungsstandards</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Regelmäßige Sicherheitsaudits</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#5469FF] flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">PCI-DSS Compliance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <p>
                Tivario ist PCI-DSS (Payment Card Industry Data Security Standard) konform. Dies bedeutet,
                dass wir die höchsten Sicherheitsstandards für Kartenzahlungen erfüllen.
              </p>
              <ul className="mt-4">
                <li>Keine Speicherung von Kartendetails auf unseren Servern</li>
                <li>Tokenisierung sensibler Zahlungsdaten</li>
                <li>Regelmäßige Sicherheitsüberprüfungen</li>
                <li>Strikte Zugangskontrollen</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">Zertifizierte Zahlungsdienstleister</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <p>
                Wir arbeiten ausschließlich mit führenden, zertifizierten Zahlungsdienstleistern:
              </p>
              
              <h4 className="mt-4 mb-2">Stripe</h4>
              <p>
                Stripe ist einer der weltweit führenden Zahlungsanbieter und wird von Millionen von Unternehmen genutzt.
                Stripe ist PCI Level 1 zertifiziert - die höchste Sicherheitsstufe in der Zahlungsbranche.
              </p>
              <p className="text-sm text-[#6B8CA8]">
                Unterstützte Zahlungsarten: Visa, Mastercard, American Express, SEPA-Lastschrift, Sofortüberweisung, giropay
              </p>

              <h4 className="mt-4 mb-2">PayPal</h4>
              <p>
                PayPal bietet Käuferschutz und ist weltweit als sichere Zahlungsmethode anerkannt.
                Über 400 Millionen Nutzer vertrauen auf PayPal.
              </p>
              <p className="text-sm text-[#6B8CA8]">
                Unterstützte Zahlungsarten: PayPal-Guthaben, Bankkonto, Kreditkarte
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">Betrugsprävention</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <p>
                Wir setzen modernste Technologien ein, um betrügerische Transaktionen zu erkennen und zu verhindern:
              </p>
              <ul className="mt-4">
                <li><strong>3D Secure 2.0:</strong> Zusätzliche Authentifizierung bei Kartenzahlungen</li>
                <li><strong>Fraud Detection:</strong> KI-gestützte Betrugserkennung in Echtzeit</li>
                <li><strong>Risiko-Scoring:</strong> Automatische Bewertung jeder Transaktion</li>
                <li><strong>Velocity Checks:</strong> Erkennung verdächtiger Muster</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#2A4D66]">Keine Speicherung von Zahlungsdaten</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <p>
                <strong>Wichtig:</strong> Tivario speichert keine Kreditkartennummern, CVV-Codes oder Bankverbindungen.
                Alle sensiblen Zahlungsdaten werden ausschließlich bei unseren zertifizierten Zahlungsdienstleistern
                verarbeitet und gespeichert.
              </p>
              <p>
                Bei Zahlungen werden die Daten direkt an Stripe oder PayPal übertragen - sie durchlaufen niemals
                unsere Server in unverschlüsselter Form.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#2A4D66]">DSGVO-Konformität</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <p>
                Alle Zahlungsvorgänge erfolgen DSGVO-konform. Deine Zahlungsdaten werden:
              </p>
              <ul>
                <li>Nur für die Abwicklung der Zahlung verwendet</li>
                <li>Nicht an Dritte weitergegeben (außer Zahlungsdienstleister)</li>
                <li>Nach gesetzlichen Aufbewahrungsfristen gelöscht</li>
                <li>Auf EU-Servern verarbeitet und gespeichert</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#EBF5FF] to-[#A8D5F2]/20 border-[#A8D5F2]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-[#7AB8E8] shrink-0" />
                <div>
                  <h3 className="font-semibold text-[#2A4D66] mb-2">Deine Sicherheit hat Priorität</h3>
                  <p className="text-sm text-[#6B8CA8]">
                    Bei Fragen zur Zahlungssicherheit oder verdächtigen Aktivitäten kontaktiere uns sofort unter:
                    <br />
                    <a href="mailto:security@tivario.com" className="text-[#7AB8E8] font-medium">security@tivario.com</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}