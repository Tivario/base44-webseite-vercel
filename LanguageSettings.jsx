import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrentLanguage, setLanguage } from '../utils/i18n';

export default function LanguageSettings() {
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <Card className="border-[#E0EEF8]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
          <Globe className="w-5 h-5" />
          Sprache / Language
        </CardTitle>
        <CardDescription>
          Wähle deine bevorzugte Sprache / Choose your preferred language
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label className="text-[#2A4D66] mb-3 block">
            App-Sprache / App Language
          </Label>
          <Select value={currentLang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="border-[#E0EEF8]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">
                <div className="flex items-center gap-2">
                  <span>🇩🇪</span>
                  <span>Deutsch</span>
                </div>
              </SelectItem>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-[#6B8CA8] mt-3">
            Die Sprache wird automatisch anhand deines Standorts vorgeschlagen.
            <br />
            The language is automatically suggested based on your location.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}