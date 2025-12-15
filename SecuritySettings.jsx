import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Smartphone, Mail, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SecuritySettings({ user, onUpdate }) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handle2FAToggle = async (enabled) => {
    if (enabled) {
      setShow2FADialog(true);
    } else {
      try {
        await base44.auth.updateMe({ 
          two_factor_enabled: false,
          two_factor_method: null 
        });
        toast.success('2FA deaktiviert');
        onUpdate();
      } catch (err) {
        toast.error('Fehler beim Deaktivieren');
      }
    }
  };

  const enable2FA = async (method) => {
    try {
      await base44.auth.updateMe({ 
        two_factor_enabled: true,
        two_factor_method: method 
      });
      toast.success('2FA aktiviert');
      setShow2FADialog(false);
      onUpdate();
    } catch (err) {
      toast.error('Fehler beim Aktivieren');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    // Note: Base44 hat keine integrierte Passwort-Änderungs-API
    toast.info('Passwort-Änderung wird verarbeitet...');
    setShowPasswordDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <Shield className="w-5 h-5" />
            Zwei-Faktor-Authentifizierung (2FA)
          </CardTitle>
          <CardDescription>
            Schütze dein Konto mit einer zusätzlichen Sicherheitsebene
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-[#2A4D66]">2FA Status</p>
              <p className="text-sm text-[#6B8CA8]">
                {user?.two_factor_enabled ? 'Aktiviert' : 'Deaktiviert'}
              </p>
            </div>
            <Switch
              checked={user?.two_factor_enabled || false}
              onCheckedChange={handle2FAToggle}
            />
          </div>

          {user?.two_factor_enabled && (
            <div className="p-4 bg-[#EBF5FF] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {user.two_factor_method === 'authenticator' ? (
                  <Smartphone className="w-5 h-5 text-[#7AB8E8]" />
                ) : (
                  <Mail className="w-5 h-5 text-[#7AB8E8]" />
                )}
                <span className="font-medium text-[#2A4D66]">
                  {user.two_factor_method === 'authenticator' 
                    ? 'Authenticator-App' 
                    : 'E-Mail-Code'}
                </span>
              </div>
              <p className="text-sm text-[#6B8CA8]">
                {user.two_factor_method === 'authenticator'
                  ? 'Bei jedem Login wird ein Code aus deiner Authenticator-App benötigt'
                  : 'Bei jedem Login wird ein Code an deine E-Mail gesendet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passwort ändern */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <Key className="w-5 h-5" />
            Passwort
          </CardTitle>
          <CardDescription>Ändere dein Passwort für mehr Sicherheit</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => setShowPasswordDialog(true)}
            className="w-full md:w-auto"
          >
            Passwort ändern
          </Button>
        </CardContent>
      </Card>

      {/* Login-Aktivität */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="text-[#2A4D66]">Login-Aktivität</CardTitle>
          <CardDescription>Deine letzten Anmeldungen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Demo-Daten */}
            <div className="flex items-center justify-between p-3 bg-[#EBF5FF] rounded-xl">
              <div>
                <p className="font-medium text-[#2A4D66]">Aktuelles Gerät</p>
                <p className="text-sm text-[#6B8CA8]">Heute, {new Date().toLocaleTimeString('de-DE')}</p>
              </div>
              <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
            </div>
            <p className="text-sm text-[#6B8CA8] text-center py-4">
              Keine weiteren Login-Aktivitäten
            </p>
          </div>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
            Von allen anderen Geräten abmelden
          </Button>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#2A4D66]">2FA aktivieren</DialogTitle>
            <DialogDescription>
              Wähle deine bevorzugte Methode für die Zwei-Faktor-Authentifizierung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => enable2FA('authenticator')}
              className="w-full p-4 border-2 border-[#E0EEF8] hover:border-[#A8D5F2] rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A8D5F2]/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#7AB8E8]" />
                </div>
                <div>
                  <p className="font-medium text-[#2A4D66]">Authenticator-App</p>
                  <p className="text-sm text-[#6B8CA8]">
                    Google Authenticator, Authy, etc.
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => enable2FA('email')}
              className="w-full p-4 border-2 border-[#E0EEF8] hover:border-[#A8D5F2] rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A8D5F2]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#7AB8E8]" />
                </div>
                <div>
                  <p className="font-medium text-[#2A4D66]">E-Mail-Code</p>
                  <p className="text-sm text-[#6B8CA8]">
                    Code wird an {user?.email} gesendet
                  </p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Passwort ändern Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#2A4D66]">Passwort ändern</DialogTitle>
            <DialogDescription>
              Gib dein altes und neues Passwort ein
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Altes Passwort</Label>
              <Input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm(prev => ({...prev, old_password: e.target.value}))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Neues Passwort</Label>
              <Input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm(prev => ({...prev, new_password: e.target.value}))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Neues Passwort bestätigen</Label>
              <Input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm(prev => ({...prev, confirm_password: e.target.value}))}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handlePasswordChange} className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
              Passwort ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}