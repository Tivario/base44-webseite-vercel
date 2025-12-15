import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, UserPlus, Copy, Share2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Referral() {
  const [user, setUser] = useState(null);
  const referralCode = user?.email?.split('@')[0] || 'CODE';
  const referralLink = `https://tivaro.base44.app/signup?ref=${referralCode}`;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link kopiert!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tivaro - Nachhaltig kaufen & verkaufen',
          text: 'Melde dich bei Tivaro an und erhalte 5€ Startguthaben!',
          url: referralLink,
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
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
          Freunde einladen
        </h1>
        <p className="text-[#6B8CA8] mb-8">Lade deine Freunde ein und erhalte Belohnungen</p>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#2A4D66]">5€ für dich, 5€ für deinen Freund</CardTitle>
                <p className="text-sm text-[#6B8CA8] mt-1">Bei jedem erfolgreichen Referral</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-[#EBF5FF] to-[#F8FBFF] rounded-xl p-6 text-center">
              <p className="text-sm text-[#6B8CA8] mb-2">Dein Referral-Code</p>
              <p className="text-3xl font-bold text-[#2A4D66] mb-4">{referralCode}</p>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-white border-[#E0EEF8]"
                />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white h-12"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Link teilen
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-[#E0EEF8] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4D66]">So funktioniert's</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: '1', text: 'Teile deinen Referral-Link mit Freunden' },
                { step: '2', text: 'Dein Freund registriert sich und macht den ersten Kauf' },
                { step: '3', text: 'Ihr erhaltet beide 5€ Guthaben' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7AB8E8] to-[#A8D5F2] flex items-center justify-center text-white font-bold shadow-lg">
                    {item.step}
                  </div>
                  <p className="text-[#2A4D66]">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}