import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tag, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DiscountCodeInput({ product, onApplyDiscount, currentDiscount }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Bitte Code eingeben');
      return;
    }

    setLoading(true);
    try {
      const codes = await base44.entities.DiscountCode.filter({
        code: code.toUpperCase(),
        seller_email: product.seller_email,
        is_active: true
      });

      if (codes.length === 0) {
        toast.error('Ungültiger Rabattcode');
        setLoading(false);
        return;
      }

      const discountCode = codes[0];

      // Validate
      const now = new Date();
      if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
        toast.error('Code noch nicht gültig');
        setLoading(false);
        return;
      }
      if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
        toast.error('Code abgelaufen');
        setLoading(false);
        return;
      }
      if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
        toast.error('Code bereits ausgeschöpft');
        setLoading(false);
        return;
      }
      if (discountCode.product_id && discountCode.product_id !== product.id) {
        toast.error('Code nicht für dieses Produkt gültig');
        setLoading(false);
        return;
      }
      if (discountCode.min_purchase && product.price < discountCode.min_purchase) {
        toast.error(`Mindestbestellwert: ${discountCode.min_purchase.toFixed(2)} €`);
        setLoading(false);
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (discountCode.discount_type === 'percentage') {
        discountAmount = (product.price * discountCode.discount_value) / 100;
      } else {
        discountAmount = discountCode.discount_value;
      }

      // Increment usage
      await base44.entities.DiscountCode.update(discountCode.id, {
        current_uses: discountCode.current_uses + 1
      });

      onApplyDiscount({
        code: discountCode.code,
        amount: discountAmount,
        id: discountCode.id
      });

      toast.success(`Rabatt angewendet: -${discountAmount.toFixed(2)} €`);
    } catch (err) {
      toast.error('Fehler beim Prüfen des Codes');
    }
    setLoading(false);
  };

  const handleRemove = () => {
    onApplyDiscount(null);
    setCode('');
  };

  if (currentDiscount) {
    return (
      <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Code "{currentDiscount.code}" angewendet
            </p>
            <p className="text-xs text-green-700">
              Rabatt: -{currentDiscount.amount.toFixed(2)} €
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          className="text-green-700 hover:text-green-900"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B8CA8]" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Rabattcode"
            className="pl-10 border-[#E0EEF8]"
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          variant="outline"
          className="border-[#A8D5F2] text-[#7AB8E8] hover:bg-[#EBF5FF]"
        >
          {loading ? 'Prüfen...' : 'Anwenden'}
        </Button>
      </div>
    </div>
  );
}