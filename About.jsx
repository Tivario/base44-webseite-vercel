import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Heart, Recycle, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  const values = [
    {
      icon: Recycle,
      title: 'Nachhaltigkeit',
      description: 'Wir fördern Kreislaufwirtschaft und reduzieren Abfall',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Eine faire Plattform für Käufer und Verkäufer',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Heart,
      title: 'Transparenz',
      description: 'Ehrliche Preise und klare Kommunikation',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Moderne Features für das beste Shopping-Erlebnis',
      color: 'from-purple-500 to-violet-600',
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
          Über Tivario
        </h1>
        <p className="text-[#6B8CA8] mb-8">Nachhaltig kaufen & verkaufen – einfach und sicher</p>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-8">
          <CardContent className="p-8">
            <p className="text-[#2A4D66] leading-relaxed mb-4">
              Tivario ist deine moderne Plattform für nachhaltigen Second-Hand-Handel. Wir verbinden Menschen, 
              die Kleidung, Schuhe, Accessoires und mehr verkaufen oder tauschen möchten, mit Käufern, die 
              nach einzigartigen Stücken und echten Schnäppchen suchen.
            </p>
            <p className="text-[#2A4D66] leading-relaxed mb-4">
              Gegründet 2024, haben wir es uns zur Mission gemacht, eine faire und transparente Community aufzubauen, 
              in der jeder sicher und einfach handeln kann. Mit integriertem Käuferschutz, direktem Messaging und 
              innovativen Features wie Produktauthentifizierung für Luxusmarken, setzen wir neue Standards im 
              Online-Secondhand-Markt.
            </p>
            <p className="text-[#2A4D66] leading-relaxed">
              Tivario steht für Kreislaufwirtschaft, Nachhaltigkeit und faire Geschäfte. Jeder verkaufte Artikel 
              ist ein Beitrag zu einer besseren, umweltfreundlicheren Zukunft. Werde Teil unserer wachsenden 
              Community und entdecke, wie einfach nachhaltiger Konsum sein kann.
            </p>
          </CardContent>
        </Card>

        <h2 className="font-display text-2xl font-bold text-[#2A4D66] mb-6">Unsere Werte</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {values.map((value, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center shadow-lg mb-4`}>
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#2A4D66] mb-2">{value.title}</h3>
                <p className="text-sm text-[#6B8CA8]">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}