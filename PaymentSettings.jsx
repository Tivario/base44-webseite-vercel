import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, CreditCard, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function PaymentSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [stripeSettings, setStripeSettings] = useState({
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_enabled: false,
  });

  const [paypalSettings, setPaypalSettings] = useState({
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_enabled: false,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData.stripe_secret_key) {
        setStripeSettings({
          stripe_secret_key: userData.stripe_secret_key || '',
          stripe_publishable_key: userData.stripe_publishable_key || '',
          stripe_enabled: userData.stripe_enabled || false,
        });
      }
      
      if (userData.paypal_client_id) {
        setPaypalSettings({
          paypal_client_id: userData.paypal_client_id || '',
          paypal_client_secret: userData.paypal_client_secret || '',
          paypal_enabled: userData.paypal_enabled || false,
        });
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  };

  const handleSaveStripe = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        stripe_secret_key: stripeSettings.stripe_secret_key,
        stripe_publishable_key: stripeSettings.stripe_publishable_key,
        stripe_enabled: stripeSettings.stripe_enabled,
      });
      toast.success('Stripe-Einstellungen gespeichert');
      loadUser();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  const handleSavePayPal = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        paypal_client_id: paypalSettings.paypal_client_id,
        paypal_client_secret: paypalSettings.paypal_client_secret,
        paypal_enabled: paypalSettings.paypal_enabled,
      });
      toast.success('PayPal-Einstellungen gespeichert');
      loadUser();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EBF5FF] rounded w-1/3" />
          <div className="h-64 bg-[#EBF5FF] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Settings')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Einstellungen
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#2A4D66]">
                Zahlungseinstellungen
              </h1>
              <p className="text-[#6B8CA8] text-sm">Payment Provider konfigurieren</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-[#2A4D66]">
            <strong>Hinweis:</strong> Diese Funktion erfordert Backend Functions. 
            Aktiviere Backend Functions in den App-Einstellungen für Payment-Integration.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="stripe" className="space-y-6">
          <TabsList className="bg-white border border-[#E0EEF8] p-1 rounded-xl w-full">
            <TabsTrigger value="stripe" className="flex-1 rounded-lg">
              Stripe
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex-1 rounded-lg">
              PayPal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stripe">
            <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
              <CardHeader>
                <CardTitle>Stripe Integration</CardTitle>
                <CardDescription>
                  Verbinde dein Stripe-Konto für sichere Zahlungsabwicklung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripe_publishable">Publishable Key</Label>
                  <Input
                    id="stripe_publishable"
                    value={stripeSettings.stripe_publishable_key}
                    onChange={(e) => setStripeSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                    placeholder="pk_live_..."
                    className="mt-1.5 font-mono text-sm"
                  />
                  <p className="text-xs text-[#6B8CA8] mt-1">
                    Öffentlicher Schlüssel für Frontend
                  </p>
                </div>

                <div>
                  <Label htmlFor="stripe_secret">Secret Key</Label>
                  <Input
                    id="stripe_secret"
                    type="password"
                    value={stripeSettings.stripe_secret_key}
                    onChange={(e) => setStripeSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                    placeholder="sk_live_..."
                    className="mt-1.5 font-mono text-sm"
                  />
                  <p className="text-xs text-[#6B8CA8] mt-1">
                    Geheimer Schlüssel für Backend (sicher gespeichert)
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="stripe_enabled"
                    checked={stripeSettings.stripe_enabled}
                    onChange={(e) => setStripeSettings(prev => ({ ...prev, stripe_enabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="stripe_enabled" className="text-sm font-normal cursor-pointer">
                    Stripe-Zahlungen aktivieren
                  </Label>
                </div>

                <Button
                  onClick={handleSaveStripe}
                  disabled={saving}
                  className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Stripe-Einstellungen speichern
                </Button>

                <div className="mt-4 p-4 bg-[#EBF5FF] rounded-xl">
                  <p className="text-sm text-[#6B8CA8]">
                    <strong>Noch kein Stripe-Konto?</strong> Registriere dich unter{' '}
                    <a 
                      href="https://stripe.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#7AB8E8] hover:underline"
                    >
                      stripe.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paypal">
            <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
              <CardHeader>
                <CardTitle>PayPal Integration</CardTitle>
                <CardDescription>
                  Verbinde dein PayPal Business-Konto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paypal_client_id">Client ID</Label>
                  <Input
                    id="paypal_client_id"
                    value={paypalSettings.paypal_client_id}
                    onChange={(e) => setPaypalSettings(prev => ({ ...prev, paypal_client_id: e.target.value }))}
                    placeholder="AYSq3RDGsmBLJE-otTkBtM-jBRd1..."
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="paypal_secret">Client Secret</Label>
                  <Input
                    id="paypal_secret"
                    type="password"
                    value={paypalSettings.paypal_client_secret}
                    onChange={(e) => setPaypalSettings(prev => ({ ...prev, paypal_client_secret: e.target.value }))}
                    placeholder="EJNJESJPn7Tj6m6..."
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="paypal_enabled"
                    checked={paypalSettings.paypal_enabled}
                    onChange={(e) => setPaypalSettings(prev => ({ ...prev, paypal_enabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="paypal_enabled" className="text-sm font-normal cursor-pointer">
                    PayPal-Zahlungen aktivieren
                  </Label>
                </div>

                <Button
                  onClick={handleSavePayPal}
                  disabled={saving}
                  className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  PayPal-Einstellungen speichern
                </Button>

                <div className="mt-4 p-4 bg-[#EBF5FF] rounded-xl">
                  <p className="text-sm text-[#6B8CA8]">
                    <strong>Noch kein PayPal Business?</strong> Erstelle ein Konto unter{' '}
                    <a 
                      href="https://www.paypal.com/de/business" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#7AB8E8] hover:underline"
                    >
                      paypal.com/business
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}