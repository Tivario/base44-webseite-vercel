import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrandAutocomplete({ value, onChange, onBrandSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef(null);

  const { data: allProducts } = useQuery({
    queryKey: ['products-for-brands'],
    queryFn: () => base44.entities.Product.filter({ status: 'aktiv' }, '-created_date', 1000),
  });

  // Get all brands with counts
  const brandsWithCounts = React.useMemo(() => {
    if (!allProducts) return [];
    
    const brandMap = {};
    allProducts.forEach(product => {
      if (product.brand) {
        const brandLower = product.brand.toLowerCase();
        if (!brandMap[brandLower]) {
          brandMap[brandLower] = {
            name: product.brand,
            count: 0
          };
        }
        brandMap[brandLower].count++;
      }
    });

    return Object.values(brandMap).sort((a, b) => b.count - a.count);
  }, [allProducts]);

  // Filter brands based on search
  const filteredBrands = React.useMemo(() => {
    if (!searchTerm.trim()) return brandsWithCounts.slice(0, 10);
    
    const term = searchTerm.toLowerCase();
    return brandsWithCounts
      .filter(brand => brand.name.toLowerCase().includes(term))
      .slice(0, 10);
  }, [searchTerm, brandsWithCounts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleBrandClick = (brand) => {
    setSearchTerm(brand.name);
    onChange(brand.name);
    onBrandSelect?.(brand.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    onBrandSelect?.('');
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8CA8]" />
        <Input
          placeholder="Marke suchen (z.B. Nike, Adidas, Zara...)"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="pl-12 pr-10 h-12 bg-white border-[#E0EEF8] focus:ring-[#A8D5F2] rounded-xl text-[#2A4D66]"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B8CA8] hover:text-[#2A4D66]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredBrands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-[#E0EEF8] overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {filteredBrands.map((brand, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBrandClick(brand)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#EBF5FF] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#A8D5F2]/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#7AB8E8]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2A4D66]">{brand.name}</p>
                      <p className="text-xs text-[#6B8CA8]">
                        {brand.count} {brand.count === 1 ? 'Artikel' : 'Artikel'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-[#6B8CA8]">
                    {brand.count} Ergebnisse
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}