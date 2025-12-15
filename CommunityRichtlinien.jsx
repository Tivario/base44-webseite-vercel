import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Users, Shield, AlertTriangle, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunityRichtlinien() {
  const rules = [
    {
      icon: Shield,
      title: 'Ehrlichkeit & Transparenz',
      color: 'from-blue-500 to-indigo-600',
      points: [
        'Beschreibe Artikel wahrheitsgemäß und vollständig',
        'Verwende nur eigene, authentische Fotos',
        'Gib den Zustand ehrlich an (keine Schäden verschweigen)',
        'Halte dich an vereinbarte Preise und Konditionen',
      ],
    },
    {
      icon: Users,
      title: 'Respektvoller Umgang',
      color: 'from-green-500 to-emerald-600',
      points: [
        'Kommuniziere höflich und respektvoll',
        'Antworte zeitnah auf Nachrichten (innerhalb 24h)',
        'Keine Beleidigungen, Diskriminierung oder Bedrohungen',
        'Respektiere Preisverhandlungen, auch bei Ablehnung',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'Verbotene Inhalte',
      color: 'from-red-500 to-rose-600',
      points: [
        'Keine gefälschten oder illegalen Waren',
        'Keine jugendgefährdenden Inhalte',
        'Keine gestohlenen Artikel',
        'Keine Drogen, Waffen oder Medikamente',
      ],
    },
    {
      icon: Ban,
      title: 'Sanktionen',
      color: 'from-purple-500 to-violet-600',
      points: [
        'Verwarnung bei kleineren Verstößen',
        'Temporäre Sperrung bei wiederholten Verstößen',
        'Permanente Sperrung bei schweren Verstößen',
        'Rechtliche Schritte bei Betrug oder Straftaten',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Legal')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Rechtsinformationen
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Community-Richtlinien
        </h1>
        <p className="text-[#6B8CA8] mb-8">Regeln für ein faires und sicheres Miteinander</p>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-8">
          <CardContent className="p-6">
            <p className="text-[#2A4D66] leading-relaxed mb-4">
              Tivario ist eine Community-Plattform. Um ein sicheres und angenehmes Umfeld für alle zu schaffen, 
              haben wir diese Richtlinien erstellt. Alle Nutzer verpflichten sich, diese einzuhalten.
            </p>
            <p className="text-[#2A4D66] leading-relaxed">
              Verstöße können gemeldet werden und führen zu Konsequenzen. Wir behalten uns das Recht vor, 
              Nutzer ohne Vorankündigung zu sperren, wenn diese gegen unsere Richtlinien verstoßen.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {rules.map((rule, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rule.color} flex items-center justify-center shadow-lg`}>
                    <rule.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#2A4D66]">{rule.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rule.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#2A4D66]">
                      <span className="text-[#7AB8E8] mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-[#2A4D66]">Spezielle Regelungen</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
            <h3>Mindestalter</h3>
            <p>
              Die Nutzung von Tivario ist ab 18 Jahren erlaubt. Minderjährige benötigen die ausdrückliche 
              Zustimmung ihrer Erziehungsberechtigten.
            </p>

            <h3>Gewerbliche Verkäufer</h3>
            <p>
              Gewerbliche Verkäufer müssen sich als solche registrieren und alle gesetzlichen Pflichten 
              erfüllen (Impressumspflicht, Widerrufsrecht, etc.).
            </p>

            <h3>Markenrechte & Urheberrecht</h3>
            <p>
              Respektiere Marken- und Urheberrechte. Das Verkaufen von gefälschten Markenprodukten ist 
              strengstens untersagt und wird zur Anzeige gebracht.
            </p>

            <h3>Datenschutz</h3>
            <p>
              Gib keine persönlichen Daten von Dritten ohne deren Zustimmung weiter. Nutze bereitgestellte 
              Kontaktmöglichkeiten für die Kommunikation.
            </p>

            <h3>Mehrfachaccounts</h3>
            <p>
              Das Erstellen mehrerer Accounts ist nicht gestattet, es sei denn, es liegt eine berechtigte 
              Geschäftsnotwendigkeit vor (z.B. privater und gewerblicher Account).
            </p>

            <h3>Spam & Werbung</h3>
            <p>
              Unerwünschte Werbung, Spam oder das Bewerben externer Dienste ist nicht erlaubt. 
              Konzentriere dich auf den Verkauf deiner eigenen Artikel.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#EBF5FF] border-[#A8D5F2] shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#2A4D66] mb-2">Verstöße melden</h3>
            <p className="text-sm text-[#6B8CA8] mb-3">
              Wenn du einen Verstoß gegen unsere Community-Richtlinien bemerkst, melde ihn bitte über die 
              Melden-Funktion oder kontaktiere uns direkt unter report@tivario.com.
            </p>
            <p className="text-sm text-[#6B8CA8]">
              Wir nehmen alle Meldungen ernst und prüfen diese innerhalb von 48 Stunden.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}