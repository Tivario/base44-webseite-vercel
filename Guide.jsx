import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, BookOpen, Package, ShoppingBag, MessageCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Guide() {
  const guides = [
    {
      icon: Package,
      title: 'Artikel verkaufen',
      description: 'Erfahre, wie du deine Artikel einstellst und erfolgreich verkaufst',
      color: 'from-purple-500 to-violet-600',
      steps: [
        'Mache gute Fotos von deinem Artikel',
        'Beschreibe den Zustand ehrlich',
        'Setze einen fairen Preis',
        'Antworte schnell auf Anfragen',
      ],
    },
    {
      icon: ShoppingBag,
      title: 'Artikel kaufen',
      description: 'So findest du tolle Schnäppchen und kaufst sicher ein',
      color: 'from-blue-500 to-indigo-600',
      steps: [
        'Nutze die Suchfilter für bessere Ergebnisse',
        'Prüfe den Zustand in der Beschreibung',
        'Stelle Fragen vor dem Kauf',
        'Nutze den Käuferschutz',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Nachrichten',
      description: 'Kommuniziere effektiv mit Käufern und Verkäufern',
      color: 'from-green-500 to-teal-600',
      steps: [
        'Sei höflich und freundlich',
        'Antworte innerhalb von 24 Stunden',
        'Kläre alle Details vor dem Kauf',
        'Nutze die Vorlagen für schnelle Antworten',
      ],
    },
    {
      icon: DollarSign,
      title: 'Auszahlungen',
      description: 'Verwalte dein Guthaben und fordere Auszahlungen an',
      color: 'from-emerald-500 to-teal-600',
      steps: [
        'Guthaben erscheint nach erfolgreicher Zustellung',
        'Mindestbetrag für Auszahlungen: 10€',
        'Auszahlungen dauern 3-5 Werktage',
        'Bankdaten sicher hinterlegen',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Anleitung
        </h1>
        <p className="text-[#6B8CA8] mb-8">Lerne, wie du Tivaro optimal nutzt</p>

        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center shadow-lg`}>
                    <guide.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#2A4D66]">{guide.title}</CardTitle>
                </div>
                <p className="text-sm text-[#6B8CA8]">{guide.description}</p>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#2A4D66]">
                      <span className="font-bold text-[#7AB8E8] mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}