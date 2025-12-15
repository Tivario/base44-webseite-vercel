import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Eye, MapPin, UserX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PrivacySettings({ user, onUpdate }) {
  const [visibility, setVisibility] = useState(user?.profile_visibility || 'public');
  const [showLocation, setShowLocation] = useState(user?.show_location ?? true);

  const { data: blockedUsers, refetch } = useQuery({
    queryKey: ['blocked-users', user?.email],
    queryFn: () => base44.entities.BlockedUser.filter({ blocker_email: user.email }),
    enabled: !!user,
  });

  const handleVisibilityChange = async (value) => {
    setVisibility(value);
    try {
      await base44.auth.updateMe({ profile_visibility: value });
      toast.success('Sichtbarkeit aktualisiert');
      onUpdate();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleLocationToggle = async (value) => {
    setShowLocation(value);
    try {
      await base44.auth.updateMe({ show_location: value });
      toast.success('Standort-Einstellung gespeichert');
      onUpdate();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleUnblock = async (blockedUserId) => {
    try {
      await base44.entities.BlockedUser.delete(blockedUserId);
      toast.success('Blockierung aufgehoben');
      refetch();
    } catch (err) {
      toast.error('Fehler beim Aufheben');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profil-Sichtbarkeit */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <Eye className="w-5 h-5" />
            Profil-Sichtbarkeit
          </CardTitle>
          <CardDescription>
            Wer kann dein Profil und deine Artikel sehen?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={visibility} onValueChange={handleVisibilityChange}>
            <SelectTrigger className="border-[#E0EEF8]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div>
                  <p className="font-medium">Öffentlich</p>
                  <p className="text-sm text-[#6B8CA8]">
                    Jeder kann dein Profil sehen
                  </p>
                </div>
              </SelectItem>
              <SelectItem value="restricted">
                <div>
                  <p className="font-medium">Eingeschränkt</p>
                  <p className="text-sm text-[#6B8CA8]">
                    Nur eingeloggte Nutzer können dein Profil sehen
                  </p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Standort-Anzeige */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <MapPin className="w-5 h-5" />
            Standort-Anzeige
          </CardTitle>
          <CardDescription>
            Verwalte die Sichtbarkeit deines Standorts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#2A4D66] font-medium">Standort anzeigen</Label>
              <p className="text-sm text-[#6B8CA8]">
                {showLocation 
                  ? 'Dein genauer Standort (Stadt) wird angezeigt'
                  : 'Nur Land oder Region wird angezeigt'}
              </p>
            </div>
            <Switch
              checked={showLocation}
              onCheckedChange={handleLocationToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blockierte Nutzer */}
      <Card className="border-[#E0EEF8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
            <UserX className="w-5 h-5" />
            Blockierte Nutzer
          </CardTitle>
          <CardDescription>
            Verwalte die Liste der blockierten Nutzer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!blockedUsers || blockedUsers.length === 0 ? (
            <p className="text-[#6B8CA8] text-center py-8">
              Keine blockierten Nutzer
            </p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blocked) => (
                <div 
                  key={blocked.id}
                  className="flex items-center justify-between p-3 bg-[#EBF5FF] rounded-xl"
                >
                  <div>
                    <p className="font-medium text-[#2A4D66]">
                      {blocked.blocked_name || blocked.blocked_email}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-[#6B8CA8]">{blocked.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(blocked.id)}
                  >
                    Blockierung aufheben
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}