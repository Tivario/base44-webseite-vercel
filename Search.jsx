import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductGrid from '../components/products/ProductGrid';
import SearchTabs from '../components/search/SearchTabs';
import FilterPanel from '../components/search/FilterPanel';
import BrandAutocomplete from '../components/search/BrandAutocomplete';

export default function SearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  const initialCategory = urlParams.get('category') || 'alle';
  const initialMode = urlParams.get('mode') || 'international';
  const initialTrade = urlParams.get('trade') || 'alle';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState(initialMode);
  const [sortBy, setSortBy] = useState('-created_date');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    category: initialCategory,
    gender: 'alle',
    size: '',
    condition: 'alle',
    priceRange: [0, 1000],
    brand: '',
    tradeOption: initialTrade,
    country: '',
    city: '',
    radius: 50,
    sellerType: 'alle',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      loadFavorites(userData.email);
    } catch (e) {}
  };

  const loadFavorites = async (email) => {
    try {
      const favs = await base44.entities.Favorite.filter({ user_email: email });
      setFavorites(favs);
    } catch (e) {}
  };

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['products-search'],
    queryFn: () => base44.entities.Product.filter({ status: 'aktiv' }, sortBy, 200),
  });

  const { data: sellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => base44.entities.User.list(),
  });

  const filteredProducts = useMemo(() => {
    if (!allProducts || !sellers) return [];

    return allProducts.filter(product => {
      // Seller type filter
      if (filters.sellerType !== 'alle') {
        const seller = sellers.find(s => s.email === product.seller_email);
        if (filters.sellerType === 'gewerblich' && !seller?.is_business) return false;
        if (filters.sellerType === 'privat' && seller?.is_business) return false;
      }
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Category
      if (filters.category !== 'alle' && product.category !== filters.category) return false;

      // Gender
      if (filters.gender !== 'alle' && product.gender !== filters.gender) return false;

      // Size
      if (filters.size && product.size !== filters.size) return false;

      // Condition
      if (filters.condition !== 'alle' && product.condition !== filters.condition) return false;

      // Price
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;

      // Brand
      if (filters.brand && !product.brand?.toLowerCase().includes(filters.brand.toLowerCase())) return false;

      // Trade option
      if (filters.tradeOption === 'ja') {
        if (product.trade_option === 'nur_verkauf') return false;
      } else if (filters.tradeOption === 'nein') {
        if (product.trade_option !== 'nur_verkauf') return false;
      }

      // Local/International filter
      if (searchMode === 'local') {
        // Show only products from Germany
        if (product.location_country !== 'Deutschland' && !product.location_country?.toLowerCase().includes('deut')) return false;
        
        if (filters.country && !product.location_country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
        if (filters.city) {
          const cityMatch = 
            product.location_city?.toLowerCase().includes(filters.city.toLowerCase()) ||
            product.location_postal?.includes(filters.city);
          if (!cityMatch) return false;
        }
      } else if (searchMode === 'international') {
        // Show all products (local + international)
      }

      return true;
    });
  }, [allProducts, sellers, searchQuery, filters, searchMode]);

  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return [];
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case '-created_date':
        return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      case 'price':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case '-price':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'alle',
      gender: 'alle',
      size: '',
      condition: 'alle',
      priceRange: [0, 1000],
      brand: '',
      tradeOption: 'alle',
      country: '',
      city: '',
      radius: 50,
      sellerType: 'alle',
    });
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#3D2314] mb-6">
          Entdecken
        </h1>

        {/* Search Tabs */}
        <div className="max-w-md mb-6">
          <SearchTabs activeTab={searchMode} onTabChange={setSearchMode} />
        </div>

        {/* Brand Search */}
        <div className="mb-4">
          <BrandAutocomplete
            value={filters.brand}
            onChange={(val) => setFilters(prev => ({ ...prev, brand: val }))}
            onBrandSelect={(brand) => {
              setFilters(prev => ({ ...prev, brand }));
              setSearchQuery('');
            }}
          />
        </div>

        {/* Search Input */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8CA8]" />
            <Input
              placeholder={searchMode === 'local' ? 'Titel oder Beschreibung...' : 'Titel oder Beschreibung...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-[#E0EEF8] focus:ring-[#A8D5F2] rounded-xl text-[#2A4D66]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B8CA8] hover:text-[#2A4D66]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 h-12 border-[#E0EEF8] bg-white rounded-xl">
              <SelectValue placeholder="Sortieren" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Neueste zuerst</SelectItem>
              <SelectItem value="price">Preis: Niedrig → Hoch</SelectItem>
              <SelectItem value="-price">Preis: Hoch → Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            searchMode={searchMode}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Desktop Filter Panel */}
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          searchMode={searchMode}
          onClearFilters={clearFilters}
        />

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-sm text-[#6B8CA8]">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'Artikel' : 'Artikel'} gefunden
              {filters.brand && <span className="font-medium"> für "{filters.brand}"</span>}
            </p>
          </div>
          <ProductGrid 
            products={sortedProducts}
            userEmail={user?.email}
            favorites={favorites}
            onFavoriteChange={() => user && loadFavorites(user.email)}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}