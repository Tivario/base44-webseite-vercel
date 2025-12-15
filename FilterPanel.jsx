import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const categories = [
  { value: 'alle', label: 'Alle Kategorien' },
  { value: 'oberteile', label: 'Oberteile' },
  { value: 'hosen', label: 'Hosen' },
  { value: 'kleider', label: 'Kleider' },
  { value: 'schuhe', label: 'Schuhe' },
  { value: 'jacken', label: 'Jacken' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'taschen', label: 'Taschen' },
  { value: 'sportswear', label: 'Sportswear' },
  { value: 'elektronik', label: 'Elektronik' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const conditions = [
  { value: 'alle', label: 'Alle Zustände' },
  { value: 'neu_mit_etikett', label: 'Neu mit Etikett' },
  { value: 'neu_ohne_etikett', label: 'Neu ohne Etikett' },
  { value: 'sehr_gut', label: 'Sehr gut' },
  { value: 'gut', label: 'Gut' },
  { value: 'akzeptabel', label: 'Akzeptabel' },
];

const genders = [
  { value: 'alle', label: 'Alle' },
  { value: 'damen', label: 'Damen' },
  { value: 'herren', label: 'Herren' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kinder', label: 'Kinder' },
];

const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '32', '34', '36', '38', '40', '42', '44', '46'];

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  searchMode, 
  onClearFilters 
}) {
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'alle' && v !== '' && !(Array.isArray(v) && v.length === 2 && v[0] === 0 && v[1] === 1000));

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-3 block">
          Preis: {filters.priceRange?.[0] || 0}€ - {filters.priceRange?.[1] || 1000}€
        </Label>
        <Slider
          value={filters.priceRange || [0, 1000]}
          min={0}
          max={1000}
          step={5}
          onValueChange={(value) => onFilterChange('priceRange', value)}
          className="py-4"
        />
      </div>

      {/* Category */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Kategorie</Label>
        <Select
          value={filters.category || 'alle'}
          onValueChange={(value) => onFilterChange('category', value)}
        >
          <SelectTrigger className="border-[#E0EEF8] focus:ring-[#A8D5F2]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Für wen?</Label>
        <Select
          value={filters.gender || 'alle'}
          onValueChange={(value) => onFilterChange('gender', value)}
        >
          <SelectTrigger className="border-[#E0EEF8] focus:ring-[#A8D5F2]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {genders.map(g => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Größe</Label>
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => onFilterChange('size', filters.size === size ? '' : size)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                filters.size === size
                  ? 'bg-[#A8D5F2] text-white border-[#A8D5F2]'
                  : 'border-[#E0EEF8] text-[#2A4D66] hover:border-[#A8D5F2]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Zustand</Label>
        <Select
          value={filters.condition || 'alle'}
          onValueChange={(value) => onFilterChange('condition', value)}
        >
          <SelectTrigger className="border-[#E0EEF8] focus:ring-[#A8D5F2]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trade Option */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Tausch möglich?</Label>
        <div className="flex gap-2">
          {['alle', 'ja', 'nein'].map(opt => (
            <button
              key={opt}
              onClick={() => onFilterChange('tradeOption', opt)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                (filters.tradeOption || 'alle') === opt
                  ? 'bg-[#A8D5F2] text-white border-[#A8D5F2]'
                  : 'border-[#E0EEF8] text-[#2A4D66] hover:border-[#A8D5F2]'
              }`}
            >
              {opt === 'alle' ? 'Egal' : opt === 'ja' ? 'Ja' : 'Nein'}
            </button>
          ))}
        </div>
      </div>

      {/* Seller Type */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Verkäufertyp</Label>
        <Select
          value={filters.sellerType || 'alle'}
          onValueChange={(val) => onFilterChange('sellerType', val)}
        >
          <SelectTrigger className="border-[#E0EEF8] focus:ring-[#A8D5F2]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle</SelectItem>
            <SelectItem value="privat">Nur privat</SelectItem>
            <SelectItem value="gewerblich">Nur gewerblich</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Local specific filters */}
      {searchMode === 'local' && (
        <>
          <div>
            <Label className="text-[#2A4D66] font-medium mb-2 block">Land</Label>
            <Input
              placeholder="z.B. Deutschland"
              value={filters.country || ''}
              onChange={(e) => onFilterChange('country', e.target.value)}
              className="border-[#E0EEF8] focus:ring-[#A8D5F2]"
            />
          </div>
          <div>
            <Label className="text-[#2A4D66] font-medium mb-2 block">Stadt / PLZ</Label>
            <Input
              placeholder="z.B. Berlin oder 10115"
              value={filters.city || ''}
              onChange={(e) => onFilterChange('city', e.target.value)}
              className="border-[#E0EEF8] focus:ring-[#A8D5F2]"
            />
          </div>
          <div>
            <Label className="text-[#2A4D66] font-medium mb-2 block">
              Umkreis: {filters.radius || 50} km
            </Label>
            <Slider
              value={[filters.radius || 50]}
              min={5}
              max={200}
              step={5}
              onValueChange={([value]) => onFilterChange('radius', value)}
              className="py-4"
            />
          </div>
        </>
      )}

      {/* Brand */}
      <div>
        <Label className="text-[#2A4D66] font-medium mb-2 block">Marke</Label>
        <Input
          placeholder="z.B. Nike, Zara..."
          value={filters.brand || ''}
          onChange={(e) => onFilterChange('brand', e.target.value)}
          className="border-[#E0EEF8] focus:ring-[#A8D5F2]"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full border-[#A8D5F2] text-[#7AB8E8] hover:bg-[#A8D5F2] hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-[#E0EEF8]">
          <h3 className="font-display font-semibold text-lg text-[#2A4D66] mb-6 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filter
          </h3>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-[#E0EEF8] text-[#2A4D66]"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-[#A8D5F2] rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-display text-[#2A4D66]">Filter</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto h-full pb-20">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}