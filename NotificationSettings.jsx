import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageCircle, Heart, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings({ user, onUpdate }) {
  const [settings, setSettings] = useState({
    notification_new_messages: user?.notification_new_messages ?? true,
    notification_likes: user?.notification_likes ?? true,
    notification_sales: user?.notification_sales ?? true,
    email_notifications: user?.email_notifications ?? true,
    email_marketing: user?.email_marketing ?? false,
  });

  const handleToggle = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await base44.auth.updateMe({ [key]: value });
      toast.success('Einstellung gespeichert');
      onUpdate();
    } catch (err) {
      toast.error('Fehler beim Speichern');
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <Bell className="w-5 h-5" />
            Push-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Erhalte Benachrichtigungen über Aktivitäten auf Tivaro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A8D5F2]/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#7AB8E8]" />
              </div>
              <div>
                <Label className="text-[#2A4D66] font-medium">Neue Nachrichten</Label>
                <p className="text-sm text-[#6B8CA8]">
                  Benachrichtigung bei neuen Chat-Nachrichten
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notification_new_messages}
              onCheckedChange={(val) => handleToggle('notification_new_messages', val)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A8D5F2]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#7AB8E8]" />
              </div>
              <div>
                <Label className="text-[#2A4D66] font-medium">Likes & Favoriten</Label>
                <p className="text-sm text-[#6B8CA8]">
                  Benachrichtigung wenn jemand deinen Artikel favorisiert
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notification_likes}
              onCheckedChange={(val) => handleToggle('notification_likes', val)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A8D5F2]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#7AB8E8]" />
              </div>
              <div>
                <Label className="text-[#2A4D66] font-medium">Verkäufe & Bestellungen</Label>
                <p className="text-sm text-[#6B8CA8]">
                  Benachrichtigung bei neuen Bestellungen deiner Artikel
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notification_sales}
              onCheckedChange={(val) => handleToggle('notification_sales', val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-Mail Notifications */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <Mail className="w-5 h-5" />
            E-Mail-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Verwalte deine E-Mail-Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-[#EBF5FF] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[#2A4D66] font-medium">Wichtige Infos</Label>
                <p className="text-sm text-[#6B8CA8]">
                  Sicherheitsmeldungen, Passwort-Reset (immer aktiviert)
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#2A4D66] font-medium">Tivaro Updates</Label>
              <p className="text-sm text-[#6B8CA8]">
                Zusammenfassungen deiner Aktivitäten
              </p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(val) => handleToggle('email_notifications', val)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#2A4D66] font-medium">Marketing & Tipps</Label>
              <p className="text-sm text-[#6B8CA8]">
                News, Angebote und Tipps von Tivaro
              </p>
            </div>
            <Switch
              checked={settings.email_marketing}
              onCheckedChange={(val) => handleToggle('email_marketing', val)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}