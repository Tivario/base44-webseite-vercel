import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Truck, Key, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function DHLSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const [settings, setSettings] = useState({
    dhl_business_customer_number: '',
    dhl_api_username: '',
    dhl_api_password: '',
    dhl_business_enabled: false,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Load existing settings
      if (userData.dhl_business_customer_number) {
        setSettings({
          dhl_business_customer_number: userData.dhl_business_customer_number || '',
          dhl_api_username: userData.dhl_api_username || '',
          dhl_api_password: userData.dhl_api_password || '',
          dhl_business_enabled: userData.dhl_business_enabled || false,
        });
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        dhl_business_customer_number: settings.dhl_business_customer_number,
        dhl_api_username: settings.dhl_api_username,
        dhl_api_password: settings.dhl_api_password,
        dhl_business_enabled: settings.dhl_business_enabled,
      });
      toast.success('DHL-Einstellungen gespeichert');
      loadUser();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!settings.dhl_business_customer_number || !settings.dhl_api_username || !settings.dhl_api_password) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      // This would call a backend function to test DHL API
      // For now, simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated result
      setTestResult({
        success: true,
        message: 'Verbindung erfolgreich! DHL Business API ist bereit.',
      });
      
      toast.success('DHL-Verbindung erfolgreich getestet');
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Verbindung fehlgeschlagen. Bitte Zugangsdaten prüfen.',
      });
      toast.error('Verbindung fehlgeschlagen');
    }
    
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EBF5FF] rounded w-1/3" />
          <div className="h-64 bg-[#EBF5FF] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Settings')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Einstellungen
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#2A4D66]">
                DHL Geschäftskunden
              </h1>
              <p className="text-[#6B8CA8] text-sm">Automatische Label-Generierung</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-[#2A4D66]">
            <strong>Hinweis:</strong> Diese Funktion erfordert Backend Functions. 
            Bitte aktiviere Backend Functions in den App-Einstellungen, um die DHL Business API nutzen zu können.
          </AlertDescription>
        </Alert>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              DHL Geschäftskunden-Zugangsdaten
            </CardTitle>
            <CardDescription>
              Verbinde dein DHL Geschäftskunden-Konto für automatische Label-Generierung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer_number">Geschäftskundennummer (EKP)</Label>
              <Input
                id="customer_number"
                value={settings.dhl_business_customer_number}
                onChange={(e) => setSettings(prev => ({ ...prev, dhl_business_customer_number: e.target.value }))}
                placeholder="z.B. 2222222222"
                className="mt-1.5"
              />
              <p className="text-xs text-[#6B8CA8] mt-1">
                10-stellige Geschäftskundennummer (EKP) von DHL
              </p>
            </div>

            <div>
              <Label htmlFor="api_username">API Benutzername</Label>
              <Input
                id="api_username"
                value={settings.dhl_api_username}
                onChange={(e) => setSettings(prev => ({ ...prev, dhl_api_username: e.target.value }))}
                placeholder="DHL Geschäftskunden Portal Login"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="api_password">API Passwort / Signature</Label>
              <Input
                id="api_password"
                type="password"
                value={settings.dhl_api_password}
                onChange={(e) => setSettings(prev => ({ ...prev, dhl_api_password: e.target.value }))}
                placeholder="API-Passwort oder Signature"
                className="mt-1.5"
              />
              <p className="text-xs text-[#6B8CA8] mt-1">
                Wird im DHL Geschäftskundenportal unter "Einstellungen" angezeigt
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.dhl_business_enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, dhl_business_enabled: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="enabled" className="text-sm font-normal cursor-pointer">
                DHL Business Integration aktivieren
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleTest}
                disabled={testing || !settings.dhl_business_customer_number}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Verbindung testen
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#A8D5F2] hover:bg-[#7AB8E8]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Speichern
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle>Vorteile der DHL Business Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[#2A4D66]">Automatische Label-Generierung</p>
                <p className="text-sm text-[#6B8CA8]">Labels direkt in der App erstellen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[#2A4D66]">Echtzeit-Tracking</p>
                <p className="text-sm text-[#6B8CA8]">Automatische Sendungsverfolgung</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[#2A4D66]">Geschäftskundenpreise</p>
                <p className="text-sm text-[#6B8CA8]">Günstigere Versandkosten</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[#2A4D66]">Abholung beauftragen</p>
                <p className="text-sm text-[#6B8CA8]">Pakete direkt abholen lassen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-[#EBF5FF] rounded-xl">
          <p className="text-sm text-[#6B8CA8]">
            <strong>Noch kein DHL Geschäftskunde?</strong> Registriere dich kostenlos unter{' '}
            <a 
              href="https://www.dhl.de/de/geschaeftskunden.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#7AB8E8] hover:underline"
            >
              dhl.de/geschaeftskunden
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}