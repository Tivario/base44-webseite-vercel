import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, FileText, Shield, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Legal() {
  const [legalData, setLegalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLegalData();
  }, []);

  const loadLegalData = async () => {
    try {
      const admins = await base44.entities.User.filter({ role: 'admin' });
      if (admins.length > 0 && admins[0].platform_legal_data) {
        setLegalData(admins[0].platform_legal_data);
      }
    } catch (e) {
      console.error('Fehler beim Laden der Rechtsdaten:', e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF] p-6">
        <div className="max-w-4xl mx-auto py-20 text-center">
          <p className="text-[#6B8CA8]">Lädt Rechtsinformationen...</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      icon: FileText,
      title: 'Allgemeine Geschäftsbedingungen (AGB)',
      description: 'Nutzungsbedingungen unserer Plattform',
      color: 'from-blue-500 to-indigo-600',
      id: 'agb',
    },
    {
      icon: Shield,
      title: 'Datenschutzerklärung',
      description: 'Wie wir deine Daten schützen und verwenden',
      color: 'from-emerald-500 to-teal-600',
      id: 'datenschutz',
    },
    {
      icon: Eye,
      title: 'Impressum',
      description: 'Rechtliche Informationen über den Betreiber',
      color: 'from-purple-500 to-violet-600',
      id: 'impressum',
    },
  ];

  const additionalPages = [
    { title: 'Widerrufsrecht & Widerrufsformular', page: 'Widerruf' },
    { title: 'Community-Richtlinien', page: 'CommunityRichtlinien' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Rechtsinformationen
        </h1>
        <p className="text-[#6B8CA8] mb-8">Transparente Informationen über unsere Plattform</p>

        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">Allgemeine Geschäftsbedingungen (AGB)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <div className="whitespace-pre-wrap">
                {legalData?.agb_content || 'AGB werden geladen...'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">Datenschutzerklärung</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              <div className="whitespace-pre-wrap">
                {legalData?.privacy_content || 'Datenschutzerklärung wird geladen...'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#2A4D66]">Impressum</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-[#2A4D66]">
              {legalData ? (
                <>
                  <h3>Angaben gemäß § 5 TMG</h3>
                  <p>
                    <strong>{legalData.company_name || 'Nicht angegeben'}</strong>
                    {legalData.legal_form && <><br />{legalData.legal_form}</>}
                    <br />{legalData.address_street || 'Nicht angegeben'}
                    <br />{legalData.address_postal || ''} {legalData.address_city || ''}
                    <br />{legalData.address_country || 'Deutschland'}
                  </p>
                  
                  {legalData.ceo_name && (
                    <>
                      <h3>Vertreten durch</h3>
                      <p>Geschäftsführer: {legalData.ceo_name}</p>
                    </>
                  )}
                  
                  <h3>Kontakt</h3>
                  <p>
                    E-Mail: {legalData.contact_email || 'Nicht angegeben'}
                    {legalData.contact_phone && <><br />Telefon: {legalData.contact_phone}</>}
                  </p>
                  
                  {(legalData.register_court || legalData.register_number) && (
                    <>
                      <h3>Registereintrag</h3>
                      <p>
                        Eintragung im Handelsregister
                        {legalData.register_court && <><br />Registergericht: {legalData.register_court}</>}
                        {legalData.register_number && <><br />Registernummer: {legalData.register_number}</>}
                      </p>
                    </>
                  )}
                  
                  {legalData.vat_id && (
                    <>
                      <h3>Umsatzsteuer-ID</h3>
                      <p>Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: {legalData.vat_id}</p>
                    </>
                  )}
                  
                  <h3>Streitschlichtung</h3>
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#7AB8E8]">
                      https://ec.europa.eu/consumers/odr
                    </a>
                  </p>
                </>
              ) : (
                <p>Impressum wird geladen...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-[#2A4D66] mb-4">
            Weitere rechtliche Informationen
          </h2>
          <div className="space-y-3">
            {additionalPages.map((item, idx) => (
              <Link
                key={idx}
                to={createPageUrl(item.page)}
                className="block p-4 bg-white/80 backdrop-blur border border-[#E0EEF8] rounded-xl hover:border-[#A8D5F2] hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2A4D66]">{item.title}</span>
                  <ArrowLeft className="w-4 h-4 text-[#6B8CA8] rotate-180" />
                </div>
              </Link>
            ))}
            <Link
              to={createPageUrl('PaymentSecurity')}
              className="block p-4 bg-white/80 backdrop-blur border border-[#E0EEF8] rounded-xl hover:border-[#A8D5F2] hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#2A4D66]">Zahlungssicherheit & Datenschutz</span>
                <ArrowLeft className="w-4 h-4 text-[#6B8CA8] rotate-180" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}