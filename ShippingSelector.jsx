import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Truck, Package, Clock, MapPin, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const carrierIcons = {
  dhl: '📦',
  dpd: '🚚',
  hermes: '📮',
  gls: '🚛',
  ups: '📫',
  deutsche_post: '✉️'
};

const carrierNames = {
  dhl: 'DHL',
  dpd: 'DPD',
  hermes: 'Hermes',
  gls: 'GLS',
  ups: 'UPS',
  deutsche_post: 'Deutsche Post'
};

const countries = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'PL', name: 'Polen' },
  { code: 'UK', name: 'Großbritannien' },
  { code: 'US', name: 'USA' },
];

export default function ShippingSelector({ onSelect, selectedOption }) {
  const [shippingCountry, setShippingCountry] = useState('DE');

  const { data: zones } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => base44.entities.ShippingZone.filter({ is_active: true }),
  });

  const { data: allOptions } = useQuery({
    queryKey: ['shipping-options'],
    queryFn: () => base44.entities.ShippingOption.filter({ is_active: true }),
  });

  // Filter options based on selected country
  const availableOptions = allOptions?.filter(option => {
    const zone = zones?.find(z => z.id === option.zone_id);
    return zone?.countries?.includes(shippingCountry);
  }) || [];

  const handleOptionSelect = (optionId) => {
    const option = availableOptions.find(o => o.id === optionId);
    onSelect({ ...option, shipping_country: shippingCountry });
  };

  return (
    <div className="space-y-6">
      {/* Country Selection */}
      <div>
        <Label className="text-[#2A4D66] mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Versandland
        </Label>
        <Select value={shippingCountry} onValueChange={setShippingCountry}>
          <SelectTrigger className="border-[#E0EEF8]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shipping Options */}
      <div>
        <Label className="text-[#2A4D66] mb-3 block">Versandart wählen</Label>
        
        {availableOptions.length === 0 ? (
          <div className="text-center py-8 bg-[#EBF5FF] rounded-xl">
            <p className="text-[#6B8CA8]">
              Leider kein Versand nach {countries.find(c => c.code === shippingCountry)?.name} verfügbar
            </p>
          </div>
        ) : (
          <RadioGroup value={selectedOption?.id} onValueChange={handleOptionSelect}>
            <div className="space-y-3">
              {availableOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOption?.id === option.id
                      ? 'border-[#A8D5F2] bg-[#A8D5F2]/5'
                      : 'border-[#E0EEF8] hover:border-[#A8D5F2]'
                  }`}
                >
                  <RadioGroupItem value={option.id} className="mt-1" />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{carrierIcons[option.carrier]}</span>
                        <div>
                          <p className="font-semibold text-[#2A4D66]">
                            {carrierNames[option.carrier]}
                          </p>
                          <p className="text-sm text-[#6B8CA8]">{option.service_name}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-[#A8D5F2]">
                        {option.price.toFixed(2)} €
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {option.delivery_time && (
                        <Badge variant="secondary" className="bg-[#EBF5FF] text-[#6B8CA8]">
                          <Clock className="w-3 h-3 mr-1" />
                          {option.delivery_time}
                        </Badge>
                      )}
                      {option.tracking_available && (
                        <Badge variant="secondary" className="bg-[#EBF5FF] text-[#6B8CA8]">
                          Sendungsverfolgung inklusive
                        </Badge>
                      )}
                      {option.max_weight && (
                        <Badge variant="secondary" className="bg-[#EBF5FF] text-[#6B8CA8]">
                          Bis {option.max_weight} kg
                        </Badge>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        )}
      </div>
    </div>
  );
}