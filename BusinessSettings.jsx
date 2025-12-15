import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Upload, Loader2, Save, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function BusinessSettings({ user, onRefresh }) {
  const [isBusiness, setIsBusiness] = useState(user?.is_business || false);
  const [businessInfo, setBusinessInfo] = useState(user?.business_info || {});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBusinessInfo(prev => ({ ...prev, [type]: file_url }));
      toast.success(type === 'logo' ? 'Logo hochgeladen' : 'Banner hochgeladen');
    } catch (err) {
      toast.error('Fehler beim Hochladen');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        is_business: isBusiness,
        business_info: businessInfo
      });
      toast.success('Änderungen gespeichert');
      onRefresh?.();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  const integrationLinks = [
    {
      icon: Truck,
      title: 'DHL Geschäftskunden',
      description: 'Automatische Label-Generierung & Geschäftskundenpreise',
      page: 'DHLSettings',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: CreditCard,
      title: 'Zahlungseinstellungen',
      description: 'Stripe & PayPal Integration konfigurieren',
      page: 'PaymentSettings',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Integration Links */}
      <Card>
        <CardHeader>
          <CardTitle>Integrationen</CardTitle>
          <CardDescription>
            Verbinde externe Dienste für erweiterte Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrationLinks.map((link, idx) => (
            <Link
              key={idx}
              to={createPageUrl(link.page)}
              className="flex items-center gap-4 p-4 bg-[#F8FBFF] hover:bg-[#EBF5FF] rounded-xl transition-colors border border-[#E0EEF8]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md shrink-0`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#2A4D66]">{link.title}</p>
                <p className="text-sm text-[#6B8CA8] truncate">{link.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B8CA8] shrink-0" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Gewerblicher Account
          </CardTitle>
          <CardDescription>
            Aktiviere diese Option, wenn du gewerblich verkaufst
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#2A4D66]">Als gewerblicher Verkäufer registrieren</Label>
              <p className="text-sm text-[#6B8CA8]">
                Zeige dein Label/Shop und rechtliche Informationen an
              </p>
            </div>
            <Switch checked={isBusiness} onCheckedChange={setIsBusiness} />
          </div>
        </CardContent>
      </Card>

      {isBusiness && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Firmendaten (Pflicht)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Firmenname / Labelname *</Label>
                <Input
                  value={businessInfo.company_name || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="z.B. Style Label GmbH"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Rechtsform</Label>
                <Input
                  value={businessInfo.legal_form || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, legal_form: e.target.value }))}
                  placeholder="z.B. GmbH, UG, Einzelunternehmen"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Straße & Hausnummer *</Label>
                  <Input
                    value={businessInfo.address_street || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address_street: e.target.value }))}
                    placeholder="Musterstraße 123"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>PLZ *</Label>
                  <Input
                    value={businessInfo.address_postal || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address_postal: e.target.value }))}
                    placeholder="10115"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stadt *</Label>
                  <Input
                    value={businessInfo.address_city || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address_city: e.target.value }))}
                    placeholder="Berlin"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Land *</Label>
                  <Input
                    value={businessInfo.address_country || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address_country: e.target.value }))}
                    placeholder="Deutschland"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Kontakt-E-Mail *</Label>
                <Input
                  type="email"
                  value={businessInfo.contact_email || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="kontakt@label.de"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Label-Präsentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {businessInfo.logo && (
                    <img src={businessInfo.logo} alt="Logo" className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  <label className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Logo hochladen
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label>Banner-Bild</Label>
                <div className="mt-2 flex items-center gap-4">
                  {businessInfo.banner && (
                    <img src={businessInfo.banner} alt="Banner" className="w-40 h-20 rounded-lg object-cover" />
                  )}
                  <label className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Banner hochladen
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label>Beschreibung</Label>
                <Textarea
                  value={businessInfo.description || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibe dein Label, deinen Style, deine Zielgruppe..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optionale Angaben</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefon</Label>
                  <Input
                    value={businessInfo.phone || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+49 30 12345678"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>USt-ID / VAT</Label>
                  <Input
                    value={businessInfo.vat_id || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, vat_id: e.target.value }))}
                    placeholder="DE123456789"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  value={businessInfo.website || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.deinlabel.de"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={businessInfo.instagram || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@deinlabel"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>TikTok</Label>
                  <Input
                    value={businessInfo.tiktok || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, tiktok: e.target.value }))}
                    placeholder="@deinlabel"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rechtliche Angaben & Impressum (Pflicht für Gewerbe)</CardTitle>
              <CardDescription>
                Diese Angaben werden auf deiner Shop-Seite und im Impressum angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Geschäftsführer/Inhaber *</Label>
                  <Input
                    value={businessInfo.ceo_name || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, ceo_name: e.target.value }))}
                    placeholder="Max Mustermann"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Registergericht</Label>
                  <Input
                    value={businessInfo.register_court || ''}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, register_court: e.target.value }))}
                    placeholder="Amtsgericht Berlin"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Registernummer (HRB/HRA)</Label>
                <Input
                  value={businessInfo.register_number || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, register_number: e.target.value }))}
                  placeholder="HRB 12345"
                  className="mt-1.5"
                />
              </div>

              <Separator />

              <div>
                <Label>AGB (Allgemeine Geschäftsbedingungen) *</Label>
                <Textarea
                  value={businessInfo.terms_content || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, terms_content: e.target.value }))}
                  placeholder="Füge hier deine AGB ein oder verlinke zu deinen AGB..."
                  rows={6}
                  className="mt-1.5"
                />
                <p className="text-xs text-[#6B8CA8] mt-1">
                  Alternativ: Link zu externen AGB
                </p>
                <Input
                  value={businessInfo.terms_url || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, terms_url: e.target.value }))}
                  placeholder="https://www.deinlabel.de/agb"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Datenschutzerklärung *</Label>
                <Textarea
                  value={businessInfo.privacy_content || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, privacy_content: e.target.value }))}
                  placeholder="Füge hier deine Datenschutzerklärung ein..."
                  rows={6}
                  className="mt-1.5"
                />
                <p className="text-xs text-[#6B8CA8] mt-1">
                  Alternativ: Link zur externen Datenschutzerklärung
                </p>
                <Input
                  value={businessInfo.privacy_url || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, privacy_url: e.target.value }))}
                  placeholder="https://www.deinlabel.de/datenschutz"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Widerrufsbelehrung & Rückgaberichtlinien *</Label>
                <Textarea
                  value={businessInfo.return_policy || ''}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, return_policy: e.target.value }))}
                  placeholder="14 Tage Widerrufsrecht gemäß BGB. Artikel müssen ungetragen und mit Etikett zurückgesendet werden..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Rechtlicher Hinweis:</strong> Als gewerblicher Verkäufer bist du verpflichtet, ein vollständiges Impressum, AGB und eine Datenschutzerklärung bereitzustellen. Nutze professionelle Rechtstexte oder lasse diese von einem Anwalt erstellen.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Änderungen speichern
      </Button>
    </div>
  );
}