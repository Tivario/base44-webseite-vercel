import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportDialog({ productId, productTitle, sellerEmail, userEmail, trigger }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Bitte wähle einen Grund');
      return;
    }
    if (!description.trim()) {
      toast.error('Bitte beschreibe das Problem');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Report.create({
        reporter_email: userEmail,
        target_user_email: sellerEmail,
        target_product_id: productId,
        target_product_title: productTitle,
        reason,
        description,
        status: 'offen',
      });
      toast.success('Meldung eingereicht. Wir prüfen das.');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (err) {
      toast.error('Fehler beim Melden');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Melden
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Artikel/Nutzer melden</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Grund der Meldung</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Wähle einen Grund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="betrug">Betrug / Verdächtige Aktivität</SelectItem>
                <SelectItem value="gefaelschte_artikel">Gefälschte Artikel</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="unangemessener_inhalt">Unangemessener Inhalt</SelectItem>
                <SelectItem value="copyright">Copyright-Verletzung</SelectItem>
                <SelectItem value="beleidigung">Beleidigung</SelectItem>
                <SelectItem value="sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Beschreibung</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bitte beschreibe das Problem detailliert..."
              rows={4}
              className="mt-1.5"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {submitting ? 'Wird gesendet...' : 'Meldung abschicken'}
          </Button>

          <p className="text-xs text-[#6B8CA8] text-center">
            Deine Meldung wird vertraulich behandelt und zeitnah geprüft.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}