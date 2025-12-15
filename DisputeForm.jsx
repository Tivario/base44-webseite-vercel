import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DisputeForm({ transaction, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const reasons = [
    { value: 'gefaelscht', label: 'Gefälschtes/nachgemachtes Produkt' },
    { value: 'nicht_wie_beschrieben', label: 'Artikel nicht wie beschrieben' },
    { value: 'beschaedigt', label: 'Beschädigt angekommen' },
    { value: 'nicht_erhalten', label: 'Artikel nicht erhalten' },
    { value: 'falsche_groesse', label: 'Falsche Größe/Farbe' },
    { value: 'sonstiges', label: 'Sonstiges' }
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (error) {
        toast.error('Fehler beim Upload');
      }
    }

    setImages([...images, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!reason || !description.trim()) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    setSubmitting(true);
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 2);

      await base44.entities.Dispute.create({
        transaction_id: transaction.id,
        product_id: transaction.product_id,
        product_title: transaction.product_title,
        buyer_email: transaction.buyer_email,
        seller_email: transaction.seller_email,
        reason,
        description,
        evidence_images: images,
        status: 'offen',
        deadline: deadline.toISOString()
      });

      // Email an Admin
      await base44.integrations.Core.SendEmail({
        to: 'admin@tivario.com',
        subject: '🚨 Neue Reklamation eingegangen',
        body: `Eine neue Reklamation wurde eingereicht:\n\nProdukt: ${transaction.product_title}\nGrund: ${reason}\nBeschreibung: ${description}\n\nBitte prüfen Sie den Fall im Admin-Bereich.`
      });

      // Email an Verkäufer
      await base44.integrations.Core.SendEmail({
        to: transaction.seller_email,
        subject: '⚠️ Reklamation zu deinem Verkauf',
        body: `Ein Käufer hat eine Reklamation zu deinem verkauften Artikel eingereicht.\n\nProdukt: ${transaction.product_title}\nGrund: ${reason}\n\nDu kannst im Admin-Bereich oder per E-Mail Stellung nehmen. Unser Team wird den Fall prüfen.`
      });

      toast.success('Reklamation eingereicht');
      onSubmitted?.();
    } catch (error) {
      toast.error('Fehler beim Einreichen');
    }
    setSubmitting(false);
  };

  return (
    <Card className="bg-white border-[#E0EEF8]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Problem melden
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-300">
          <AlertDescription className="text-sm text-[#2A4D66]">
            <strong>Käuferschutz:</strong> Bei gefälschten oder stark abweichenden Artikeln erhältst du den vollen Kaufpreis zurück und darfst das Produkt behalten. Bitte reiche aussagekräftige Fotos als Beweis ein.
          </AlertDescription>
        </Alert>

        <div>
          <Label>Grund der Reklamation *</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Bitte wählen..." />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Detaillierte Beschreibung *</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibe das Problem so genau wie möglich..."
            rows={5}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Beweisfotos hochladen</Label>
          <p className="text-xs text-[#6B8CA8] mb-2">
            Lade Fotos hoch, die das Problem zeigen (z.B. Fake-Merkmale, Beschädigungen)
          </p>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E0EEF8]">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#E0EEF8] rounded-xl cursor-pointer hover:border-[#A8D5F2] transition-colors">
            <Upload className="w-5 h-5 text-[#6B8CA8]" />
            <span className="text-sm text-[#6B8CA8]">
              {uploading ? 'Lädt hoch...' : 'Fotos hinzufügen'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <Alert className="bg-amber-50 border-amber-300">
          <AlertDescription className="text-sm text-amber-800">
            <strong>Hinweis:</strong> Du hast 2 Tage nach Erhalt Zeit, ein Problem zu melden. Bitte reiche ausreichend Beweise ein, damit wir deinen Fall schnell bearbeiten können.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !reason || !description.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {submitting ? 'Wird eingereicht...' : 'Reklamation einreichen'}
        </Button>
      </CardContent>
    </Card>
  );
}