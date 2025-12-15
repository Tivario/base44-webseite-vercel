import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCVerification() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [idDocument, setIdDocument] = useState('');
  const [selfie, setSelfie] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    address: '',
    id_number: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.kyc_data) {
        setFormData(userData.kyc_data);
        setIdDocument(userData.kyc_data.id_document);
        setSelfie(userData.kyc_data.selfie);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'id') setIdDocument(file_url);
      else setSelfie(file_url);
      toast.success('Dokument hochgeladen');
    } catch (err) {
      toast.error('Upload fehlgeschlagen');
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.birth_date || !idDocument || !selfie) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    try {
      await base44.auth.updateMe({
        kyc_data: { ...formData, id_document: idDocument, selfie },
        kyc_status: 'pending'
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: 'admin@tivario.com',
        subject: `Neue KYC-Verifizierung - ${user.email}`,
        body: `Nutzer ${user.email} hat KYC-Dokumente eingereicht.\n\nBitte im Admin-Panel prüfen.`
      });

      toast.success('Verifizierung eingereicht. Wir prüfen deine Daten.');
      window.location.reload();
    } catch (err) {
      toast.error('Fehler beim Senden');
    }
  };

  if (!user) return <div className="p-8">Lädt...</div>;

  if (user.kyc_verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF] p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#2A4D66] mb-2">Verifiziert!</h2>
              <p className="text-[#6B8CA8]">Dein Account ist verifiziert. Du kannst Auszahlungen anfordern.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.kyc_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF] p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-blue-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-[#2A4D66] mb-2">In Prüfung</h2>
              <p className="text-[#6B8CA8]">Wir prüfen deine Dokumente. Das dauert normalerweise 1-2 Werktage.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
            Identitäts-Verifizierung (KYC)
          </h1>
          <p className="text-[#6B8CA8]">
            Für Auszahlungen benötigen wir eine Identitätsprüfung (gesetzliche Vorgabe).
          </p>
        </div>

        <Card className="bg-white border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Persönliche Daten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vollständiger Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Max Mustermann"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Geburtsdatum *</Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Vollständige Adresse *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Musterstraße 1, 10115 Berlin, Deutschland"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Ausweis-/Reisepass-Nummer *</Label>
              <Input
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                placeholder="T1234567"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Ausweisdokument (Vorder- & Rückseite) *</Label>
              <div className="mt-2">
                {idDocument && <img src={idDocument} className="w-full max-w-sm rounded-lg mb-2" />}
                <label className="cursor-pointer">
                  <Button variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Ausweis hochladen
                    </span>
                  </Button>
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'id')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <Label>Selfie mit Ausweis *</Label>
              <p className="text-xs text-[#6B8CA8] mb-2">Halte deinen Ausweis neben dein Gesicht</p>
              <div className="mt-2">
                {selfie && <img src={selfie} className="w-full max-w-sm rounded-lg mb-2" />}
                <label className="cursor-pointer">
                  <Button variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Selfie hochladen
                    </span>
                  </Button>
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'selfie')} className="hidden" />
                </label>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8] mt-6">
              Verifizierung absenden
            </Button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Deine Daten sind sicher:</strong> Alle Dokumente werden verschlüsselt gespeichert und nur für die Identitätsprüfung verwendet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}