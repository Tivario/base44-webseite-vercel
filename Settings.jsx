import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Shield, Bell, Lock, FileText, Trash2, Globe, Building2, Gavel } from 'lucide-react';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import DataSettings from '../components/settings/DataSettings';
import DeleteAccount from '../components/settings/DeleteAccount';
import LanguageSettings from '../components/settings/LanguageSettings';
import BusinessSettings from '../components/settings/BusinessSettings';
import AdminLegalSettings from '../components/settings/AdminLegalSettings';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  const refreshUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EBF5FF] rounded w-1/4" />
          <div className="h-64 bg-[#EBF5FF] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Einstellungen
        </h1>
        <p className="text-[#6B8CA8]">Verwalte dein Konto und deine Präferenzen</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`bg-[#EBF5FF] p-1 rounded-xl w-full grid gap-1 ${user?.role === 'admin' ? 'grid-cols-5 md:grid-cols-9' : 'grid-cols-4 md:grid-cols-8'}`}>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <Building2 className="w-4 h-4" />
            <span className="hidden md:inline">Business</span>
          </TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="legal" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
              <Gavel className="w-4 h-4" />
              <span className="hidden md:inline">Rechtliches</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Sicherheit</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline">Benachrichtigungen</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden md:inline">Datenschutz</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <Globe className="w-4 h-4" />
            <span className="hidden md:inline">Sprache</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Daten</span>
          </TabsTrigger>
          <TabsTrigger value="delete" className="rounded-lg data-[state=active]:bg-white gap-2 text-xs md:text-sm">
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Löschen</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings user={user} onUpdate={refreshUser} />
        </TabsContent>

        <TabsContent value="business">
          <BusinessSettings user={user} onRefresh={refreshUser} />
        </TabsContent>

        {user?.role === 'admin' && (
          <TabsContent value="legal">
            <AdminLegalSettings user={user} />
          </TabsContent>
        )}

        <TabsContent value="security">
          <SecuritySettings user={user} onUpdate={refreshUser} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings user={user} onUpdate={refreshUser} />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings user={user} onUpdate={refreshUser} />
        </TabsContent>

        <TabsContent value="language">
          <LanguageSettings />
        </TabsContent>

        <TabsContent value="data">
          <DataSettings user={user} />
        </TabsContent>

        <TabsContent value="delete">
          <DeleteAccount user={user} />
        </TabsContent>
      </Tabs>

      {/* Rechtliches Footer */}
      <div className="mt-12 pt-6 border-t border-[#E0EEF8]">
        <h3 className="font-medium text-[#2A4D66] mb-3">Rechtliches & Info</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="#" className="text-[#7AB8E8] hover:text-[#6BB5E8]">Impressum</a>
          <a href="#" className="text-[#7AB8E8] hover:text-[#6BB5E8]">Datenschutzerklärung</a>
          <a href="#" className="text-[#7AB8E8] hover:text-[#6BB5E8]">AGB / Nutzungsbedingungen</a>
          <a href="#" className="text-[#7AB8E8] hover:text-[#6BB5E8]">Hilfe & Support</a>
        </div>
      </div>
    </div>
  );
}