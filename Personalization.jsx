import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Personalization() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    show_recommendations: true,
    preferred_categories: [],
    show_sustainable_only: false,
    show_local_only: false,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.preferences) {
        setPreferences(userData.preferences);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const handleSave = async () => {
    try {
      await base44.auth.updateMe({ preferences });
      toast.success('Einstellungen gespeichert');
    } catch (e) {
      toast.error('Fehler beim Speichern');
    }
  };

  const categories = [
    'oberteile', 'hosen', 'kleider', 'schuhe', 'jacken', 
    'accessoires', 'taschen', 'sportswear', 'elektronik', 'lifestyle'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Personalisierung
        </h1>
        <p className="text-[#6B8CA8] mb-8">Passe deine Empfehlungen und Anzeigen an</p>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-4">
          <CardHeader>
            <CardTitle className="text-[#2A4D66]">Empfehlungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Personalisierte Empfehlungen anzeigen</Label>
              <Switch
                checked={preferences.show_recommendations}
                onCheckedChange={(val) => setPreferences({...preferences, show_recommendations: val})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Nur nachhaltige Artikel</Label>
              <Switch
                checked={preferences.show_sustainable_only}
                onCheckedChange={(val) => setPreferences({...preferences, show_sustainable_only: val})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Nur lokale Angebote</Label>
              <Switch
                checked={preferences.show_local_only}
                onCheckedChange={(val) => setPreferences({...preferences, show_local_only: val})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-4">
          <CardHeader>
            <CardTitle className="text-[#2A4D66]">Bevorzugte Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={cat}
                    checked={preferences.preferred_categories?.includes(cat)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...(preferences.preferred_categories || []), cat]
                        : (preferences.preferred_categories || []).filter(c => c !== cat);
                      setPreferences({...preferences, preferred_categories: updated});
                    }}
                  />
                  <Label htmlFor={cat} className="text-sm capitalize">{cat}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#7AB8E8] to-[#A8D5F2] text-white h-12 shadow-lg"
        >
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}