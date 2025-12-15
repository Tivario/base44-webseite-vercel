import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpCenter() {
  const faqs = [
    {
      q: 'Wie verkaufe ich einen Artikel?',
      a: 'Gehe auf "Verkaufen", lade Fotos hoch, füge eine Beschreibung hinzu und setze einen Preis. Fertig!',
    },
    {
      q: 'Wann erhalte ich mein Geld?',
      a: 'Das Geld wird nach erfolgreicher Zustellung des Artikels freigegeben und kann dann ausgezahlt werden.',
    },
    {
      q: 'Wie funktioniert der Käuferschutz?',
      a: 'Der Käuferschutz sichert deine Zahlung ab. Bei Problemen mit dem Artikel kannst du eine Reklamation einreichen.',
    },
    {
      q: 'Kann ich Artikel tauschen?',
      a: 'Ja! Du kannst beim Einstellen auswählen, ob du tauschen möchtest. Kontaktiere dann den Verkäufer.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Hilfe-Center
        </h1>
        <p className="text-[#6B8CA8] mb-8">Wir helfen dir bei deinen Fragen</p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button className="h-auto p-6 bg-gradient-to-br from-[#7AB8E8] to-[#A8D5F2] text-white flex-col gap-2">
            <MessageCircle className="w-8 h-8" />
            <span className="font-semibold">Live Chat</span>
            <span className="text-sm opacity-90">Chatte mit unserem Support</span>
          </Button>
          <Button variant="outline" className="h-auto p-6 flex-col gap-2">
            <Mail className="w-8 h-8 text-[#7AB8E8]" />
            <span className="font-semibold text-[#2A4D66]">E-Mail Support</span>
            <span className="text-sm text-[#6B8CA8]">support@tivario.com</span>
          </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
              <HelpCircle className="w-5 h-5" />
              Häufig gestellte Fragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-[#F8FBFF] rounded-xl">
                  <p className="font-semibold text-[#2A4D66] mb-2">{faq.q}</p>
                  <p className="text-sm text-[#6B8CA8]">{faq.a}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}