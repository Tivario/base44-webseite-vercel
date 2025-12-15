import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewForm({ transaction, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Bitte wähle eine Bewertung');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        reviewer_email: transaction.buyer_email,
        seller_email: transaction.seller_email,
        transaction_id: transaction.id,
        product_title: transaction.product_title,
        rating,
        comment,
      });
      toast.success('Bewertung abgegeben!');
      onSuccess?.();
    } catch (err) {
      toast.error('Fehler beim Bewerten');
    }
    setSubmitting(false);
  };

  return (
    <Card className="bg-white border-[#E0EEF8] shadow-lg">
      <CardHeader>
        <CardTitle>Verkäufer bewerten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-[#6B8CA8] mb-2">Wie war deine Erfahrung?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-[#6B8CA8] mb-2">Kommentar (optional)</p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Teile deine Erfahrung..."
            rows={4}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]"
        >
          {submitting ? 'Wird gesendet...' : 'Bewertung abgeben'}
        </Button>
      </CardContent>
    </Card>
  );
}