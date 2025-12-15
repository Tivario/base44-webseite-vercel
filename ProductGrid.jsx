import React from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

export default function ProductGrid({ products, userEmail, favorites = [], onFavoriteChange, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-[#EBF5FF] rounded-2xl mb-3" />
            <div className="space-y-2 px-1">
              <div className="h-3 bg-[#EBF5FF] rounded w-1/3" />
              <div className="h-4 bg-[#EBF5FF] rounded w-2/3" />
              <div className="h-4 bg-[#EBF5FF] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#EBF5FF] flex items-center justify-center">
          <span className="text-3xl">👗</span>
        </div>
        <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Keine Artikel gefunden</h3>
        <p className="text-[#6B8CA8]">Versuche andere Suchkriterien</p>
      </div>
    );
  }

  const favoriteIds = favorites.map(f => f.product_id);

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <ProductCard
            product={product}
            userEmail={userEmail}
            isFavorited={favoriteIds.includes(product.id)}
            onFavoriteChange={onFavoriteChange}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}