import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function OfferDialog({ product, user, children }) {
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const queryClient = useQueryClient();

  const createOfferMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Offer.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['offers']);
      toast.success('Preisvorschlag gesendet!');
      setOpen(false);
      setOfferPrice('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const price = parseFloat(offerPrice);
    if (!price || price <= 0) {
      toast.error('Bitte gib einen gültigen Preis ein');
      return;
    }

    if (price >= product.price) {
      toast.error('Dein Angebot muss unter dem aktuellen Preis liegen');
      return;
    }

    // Set expiry to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    createOfferMutation.mutate({
      product_id: product.id,
      product_title: product.title,
      product_image: product.images?.[0] || '',
      original_price: product.price,
      buyer_email: user.email,
      seller_email: product.seller_email,
      proposed_price: price,
      status: 'offen',
      last_action_by: 'buyer',
      expires_at: expiresAt.toISOString(),
    });
  };

  const discount = offerPrice ? (((product.price - parseFloat(offerPrice)) / product.price) * 100).toFixed(0) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex-1 border-[#A8D5F2] text-[#7AB8E8] hover:bg-[#EBF5FF]">
            <TrendingDown className="w-5 h-5 mr-2" />
            Preis vorschlagen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preisvorschlag senden</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="bg-[#F8FBFF] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#6B8CA8]">Aktueller Preis</span>
              <span className="font-bold text-[#2A4D66]">{product.price.toFixed(2)} €</span>
            </div>
            {offerPrice && parseFloat(offerPrice) > 0 && parseFloat(offerPrice) < product.price && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Ersparnis</span>
                <span className="font-bold text-green-600">-{discount}%</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-[#2A4D66] mb-2 block">Dein Preisvorschlag</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={product.price - 0.01}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="z.B. 25.00"
                className="pr-12 border-[#E0EEF8] focus:ring-[#A8D5F2] text-lg h-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B8CA8]">€</span>
            </div>
            <p className="text-xs text-[#6B8CA8] mt-2">
              Das Angebot ist 48 Stunden gültig
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={createOfferMutation.isPending || !offerPrice}
              className="flex-1 bg-[#A8D5F2] hover:bg-[#7AB8E8]"
            >
              {createOfferMutation.isPending ? (
                'Wird gesendet...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Senden
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}