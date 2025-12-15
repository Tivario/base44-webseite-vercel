import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function ReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6B8CA8]">Noch keine Bewertungen</p>
      </div>
    );
  }

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl font-bold text-[#2A4D66]">{avgRating}</div>
        <div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(parseFloat(avgRating))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#6B8CA8]">{reviews.length} Bewertungen</p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white border-[#E0EEF8]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#6B8CA8]">
                  {new Date(review.created_date).toLocaleDateString('de-DE')}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-[#2A4D66]">{review.comment}</p>
              )}
              <p className="text-xs text-[#6B8CA8] mt-2">
                Artikel: {review.product_title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}