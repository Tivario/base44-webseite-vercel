import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plane, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function VacationMode() {
  const [user, setUser] = useState(null);
  const [vacationMode, setVacationMode] = useState(false);
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setVacationMode(userData.vacation_mode || false);
      setReturnDate(userData.vacation_return_date || '');
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const handleSave = async () => {
    try {
      await base44.auth.updateMe({ 
        vacation_mode: vacationMode,
        vacation_return_date: returnDate
      });
      
      // Update all active products
      if (vacationMode) {
        const products = await base44.entities.Product.filter({ 
          seller_email: user.email, 
          status: 'aktiv' 
        });
        for (const product of products) {
          await base44.entities.Product.update(product.id, { status: 'deaktiviert' });
        }
      }
      
      toast.success(vacationMode ? 'Urlaubsmodus aktiviert' : 'Urlaubsmodus deaktiviert');
    } catch (e) {
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Urlaubsmodus
        </h1>
        <p className="text-[#6B8CA8] mb-8">Pausiere deine Verkäufe temporär</p>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-[#2A4D66]">Urlaubsmodus aktivieren</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Was passiert im Urlaubsmodus?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Alle deine aktiven Artikel werden deaktiviert</li>
                  <li>Du erhältst keine neuen Nachrichten zu Verkäufen</li>
                  <li>Dein Profil zeigt an, dass du im Urlaub bist</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-[#2A4D66]">Urlaubsmodus</Label>
              <Switch
                checked={vacationMode}
                onCheckedChange={setVacationMode}
              />
            </div>

            {vacationMode && (
              <div>
                <Label className="text-[#2A4D66]">Rückkehrdatum (optional)</Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="mt-1.5 border-[#E0EEF8]"
                />
                <p className="text-xs text-[#6B8CA8] mt-2">
                  Wann bist du wieder aktiv?
                </p>
              </div>
            )}
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