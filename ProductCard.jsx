import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Heart, ArrowRightLeft, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuthBadge from './AuthBadge';

const conditionLabels = {
  neu_mit_etikett: 'Neu mit Etikett',
  neu_ohne_etikett: 'Neu',
  sehr_gut: 'Sehr gut',
  gut: 'Gut',
  akzeptabel: 'Akzeptabel'
};

export default function ProductCard({ product, userEmail, onFavoriteChange, isFavorited = false }) {
  const [favorite, setFavorite] = useState(isFavorited);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userEmail) {
      base44.auth.redirectToLogin();
      return;
    }

    try {
      if (favorite) {
        const favs = await base44.entities.Favorite.filter({ 
          product_id: product.id, 
          user_email: userEmail 
        });
        if (favs.length > 0) {
          await base44.entities.Favorite.delete(favs[0].id);
        }
      } else {
        await base44.entities.Favorite.create({
          product_id: product.id,
          user_email: userEmail
        });
      }
      setFavorite(!favorite);
      onFavoriteChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  const showTradeOption = product.trade_option === 'nur_tausch' || product.trade_option === 'verkauf_oder_tausch';

  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
      <motion.div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E0EEF8]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#EBF5FF]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B8CA8]">
              Kein Bild
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              favorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 backdrop-blur-sm text-[#3D2314] hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showTradeOption && (
              <Badge className="bg-[#2A4D66] text-white gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Tausch
              </Badge>
            )}
            {product.is_high_value_brand && (
              <AuthBadge status={product.auth_status} size="small" />
            )}
          </div>

          {/* Condition Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[#2A4D66]">
              {conditionLabels[product.condition] || product.condition}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#6B8CA8] uppercase tracking-wide mb-1">
                {product.brand || 'Keine Marke'}
              </p>
              <h3 className="font-medium text-[#2A4D66] truncate">
                {product.title}
              </h3>
            </div>
            <p className="font-bold text-lg text-[#7AB8E8] whitespace-nowrap">
              {product.trade_option === 'nur_tausch' ? (
                <span className="text-sm">Nur Tausch</span>
              ) : (
                `${product.price?.toFixed(2)} €`
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B8CA8]">
            {product.size && (
              <span className="px-2 py-0.5 bg-[#EBF5FF] rounded-full">
                Größe {product.size}
              </span>
            )}
            {product.location_city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {product.location_city}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}