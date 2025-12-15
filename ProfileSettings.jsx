import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettings({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    display_name: user?.display_name || user?.full_name || '',
    bio: user?.bio || '',
    city: user?.city || '',
    country: user?.country || 'Deutschland',
    profile_image: user?.profile_image || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setChanged(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image: file_url }));
      setChanged(true);
      toast.success('Bild hochgeladen');
    } catch (err) {
      toast.error('Fehler beim Hochladen');
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profile_image: '' }));
    setChanged(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setChanged(false);
      toast.success('Änderungen gespeichert');
      onUpdate();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  return (
    <Card className="border-[#E0EEF8]">
      <CardHeader>
        <CardTitle className="text-[#2A4D66]">Profil bearbeiten</CardTitle>
        <CardDescription>Verwalte deine öffentlichen Profilinformationen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profilbild */}
        <div>
          <Label className="text-[#2A4D66] mb-3 block">Profilbild</Label>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              {formData.profile_image ? (
                <AvatarImage src={formData.profile_image} alt="Profil" />
              ) : (
                <AvatarFallback className="bg-[#A8D5F2] text-white text-2xl">
                  {formData.display_name?.[0] || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex gap-2">
              <label>
                <Button variant="outline" disabled={uploading} asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Lädt...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Hochladen
                      </>
                    )}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {formData.profile_image && (
                <Button variant="outline" onClick={handleRemoveImage}>
                  <X className="w-4 h-4 mr-2" />
                  Entfernen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Anzeigename */}
        <div>
          <Label htmlFor="display_name" className="text-[#2A4D66]">
            Anzeigename / Benutzername
          </Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder="Dein Name"
            className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
          />
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="text-[#2A4D66]">
            Kurzbeschreibung / Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Erzähl etwas über dich..."
            rows={3}
            maxLength={200}
            className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
          />
          <p className="text-sm text-[#6B8CA8] mt-1">
            {formData.bio?.length || 0} / 200 Zeichen
          </p>
        </div>

        {/* Wohnort */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-[#2A4D66]">Stadt / Wohnort</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="z.B. Berlin"
              className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
            />
          </div>
          <div>
            <Label htmlFor="country" className="text-[#2A4D66]">Land</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="z.B. Deutschland"
              className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
            />
          </div>
        </div>

        {/* E-Mail (read-only) */}
        <div>
          <Label className="text-[#2A4D66]">E-Mail-Adresse</Label>
          <Input
            value={user?.email}
            disabled
            className="mt-1.5 bg-[#EBF5FF] border-[#E0EEF8]"
          />
          <p className="text-sm text-[#6B8CA8] mt-1">
            E-Mail kann momentan nicht geändert werden
          </p>
        </div>

        {/* Speichern Button */}
        {changed && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E0EEF8]">
            <p className="text-sm text-[#6B8CA8]">Du hast ungespeicherte Änderungen</p>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Speichert...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Änderungen speichern
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}