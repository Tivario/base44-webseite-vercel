import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Package, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const carriers = [
  { value: 'dhl', label: 'DHL' },
  { value: 'dpd', label: 'DPD' },
  { value: 'hermes', label: 'Hermes' },
  { value: 'gls', label: 'GLS' },
  { value: 'ups', label: 'UPS' },
  { value: 'deutsche_post', label: 'Deutsche Post' },
];

const commonCountries = [
  'DE', 'AT', 'CH', 'FR', 'IT', 'NL', 'BE', 'ES', 'PL', 'UK', 'US', 'DK', 'SE', 'NO'
];

export default function ShippingManagement() {
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const queryClient = useQueryClient();

  const { data: zones } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => base44.entities.ShippingZone.list(),
  });

  const { data: options } = useQuery({
    queryKey: ['shipping-options'],
    queryFn: () => base44.entities.ShippingOption.list(),
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    countries: [],
    is_active: true
  });

  const [optionForm, setOptionForm] = useState({
    carrier: 'dhl',
    service_name: '',
    zone_id: '',
    price: '',
    max_weight: '',
    max_dimensions: '',
    delivery_time: '',
    tracking_available: true,
    is_active: true
  });

  const createZoneMutation = useMutation({
    mutationFn: (data) => base44.entities.ShippingZone.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-zones']);
      setShowZoneDialog(false);
      resetZoneForm();
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShippingZone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-zones']);
      setShowZoneDialog(false);
      resetZoneForm();
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id) => base44.entities.ShippingZone.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['shipping-zones']),
  });

  const createOptionMutation = useMutation({
    mutationFn: (data) => base44.entities.ShippingOption.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-options']);
      setShowOptionDialog(false);
      resetOptionForm();
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShippingOption.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-options']);
      setShowOptionDialog(false);
      resetOptionForm();
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (id) => base44.entities.ShippingOption.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['shipping-options']),
  });

  const resetZoneForm = () => {
    setZoneForm({ name: '', countries: [], is_active: true });
    setEditingZone(null);
  };

  const resetOptionForm = () => {
    setOptionForm({
      carrier: 'dhl',
      service_name: '',
      zone_id: '',
      price: '',
      max_weight: '',
      max_dimensions: '',
      delivery_time: '',
      tracking_available: true,
      is_active: true
    });
    setEditingOption(null);
  };

  const handleZoneSubmit = (e) => {
    e.preventDefault();
    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, data: zoneForm });
    } else {
      createZoneMutation.mutate(zoneForm);
    }
  };

  const handleOptionSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...optionForm,
      price: parseFloat(optionForm.price),
      max_weight: optionForm.max_weight ? parseFloat(optionForm.max_weight) : null,
    };
    if (editingOption) {
      updateOptionMutation.mutate({ id: editingOption.id, data });
    } else {
      createOptionMutation.mutate(data);
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm(zone);
    setShowZoneDialog(true);
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    setOptionForm(option);
    setShowOptionDialog(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Versandverwaltung
        </h1>
        <p className="text-[#6B8CA8]">Verwalte Versandzonen und Versandoptionen</p>
      </div>

      <Tabs defaultValue="zones">
        <TabsList className="bg-[#EBF5FF] p-1 rounded-xl mb-6">
          <TabsTrigger value="zones" className="rounded-lg data-[state=active]:bg-white">
            <MapPin className="w-4 h-4 mr-2" />
            Versandzonen
          </TabsTrigger>
          <TabsTrigger value="options" className="rounded-lg data-[state=active]:bg-white">
            <Package className="w-4 h-4 mr-2" />
            Versandoptionen
          </TabsTrigger>
        </TabsList>

        {/* Zones Tab */}
        <TabsContent value="zones">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[#6B8CA8]">{zones?.length || 0} Versandzonen</p>
            <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]" onClick={resetZoneForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Zone hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingZone ? 'Zone bearbeiten' : 'Neue Zone erstellen'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleZoneSubmit} className="space-y-4">
                  <div>
                    <Label>Name der Zone</Label>
                    <Input
                      value={zoneForm.name}
                      onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})}
                      placeholder="z.B. Deutschland, EU, Weltweit"
                      required
                    />
                  </div>
                  <div>
                    <Label>Ländercodes (Komma-getrennt)</Label>
                    <Input
                      value={zoneForm.countries?.join(', ') || ''}
                      onChange={(e) => setZoneForm({
                        ...zoneForm, 
                        countries: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                      })}
                      placeholder="z.B. DE, AT, CH"
                      required
                    />
                    <p className="text-xs text-[#6B8CA8] mt-1">
                      Verfügbar: {commonCountries.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Zone aktiv</Label>
                    <Switch
                      checked={zoneForm.is_active}
                      onCheckedChange={(val) => setZoneForm({...zoneForm, is_active: val})}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowZoneDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                      {editingZone ? 'Speichern' : 'Erstellen'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {zones?.map(zone => (
              <Card key={zone.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-[#2A4D66]">{zone.name}</h3>
                        {!zone.is_active && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Inaktiv
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {zone.countries?.map(country => (
                          <Badge key={country} variant="secondary" className="bg-[#EBF5FF] text-[#6B8CA8]">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditZone(zone)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteZoneMutation.mutate(zone.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[#6B8CA8]">{options?.length || 0} Versandoptionen</p>
            <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]" onClick={resetOptionForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Option hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingOption ? 'Option bearbeiten' : 'Neue Option erstellen'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOptionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Versanddienstleister</Label>
                      <Select
                        value={optionForm.carrier}
                        onValueChange={(val) => setOptionForm({...optionForm, carrier: val})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {carriers.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Service Name</Label>
                      <Input
                        value={optionForm.service_name}
                        onChange={(e) => setOptionForm({...optionForm, service_name: e.target.value})}
                        placeholder="z.B. Paket, S-Paket"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Versandzone</Label>
                    <Select
                      value={optionForm.zone_id}
                      onValueChange={(val) => setOptionForm({...optionForm, zone_id: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zone wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {zones?.map(zone => (
                          <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Preis (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={optionForm.price}
                        onChange={(e) => setOptionForm({...optionForm, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Max. Gewicht (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={optionForm.max_weight}
                        onChange={(e) => setOptionForm({...optionForm, max_weight: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max. Abmessungen</Label>
                      <Input
                        value={optionForm.max_dimensions}
                        onChange={(e) => setOptionForm({...optionForm, max_dimensions: e.target.value})}
                        placeholder="z.B. 60x40x30 cm"
                      />
                    </div>
                    <div>
                      <Label>Lieferzeit</Label>
                      <Input
                        value={optionForm.delivery_time}
                        onChange={(e) => setOptionForm({...optionForm, delivery_time: e.target.value})}
                        placeholder="z.B. 1-3 Werktage"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Tracking verfügbar</Label>
                    <Switch
                      checked={optionForm.tracking_available}
                      onCheckedChange={(val) => setOptionForm({...optionForm, tracking_available: val})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Option aktiv</Label>
                    <Switch
                      checked={optionForm.is_active}
                      onCheckedChange={(val) => setOptionForm({...optionForm, is_active: val})}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowOptionDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit" className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                      {editingOption ? 'Speichern' : 'Erstellen'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {options?.map(option => {
              const zone = zones?.find(z => z.id === option.zone_id);
              return (
                <Card key={option.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#2A4D66]">
                            {carriers.find(c => c.value === option.carrier)?.label} - {option.service_name}
                          </h3>
                          {!option.is_active && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Inaktiv
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-[#6B8CA8]">
                          <p>Zone: {zone?.name || 'Unbekannt'}</p>
                          <p>Preis: {option.price?.toFixed(2)} €</p>
                          {option.delivery_time && <p>Lieferzeit: {option.delivery_time}</p>}
                          {option.max_weight && <p>Max. Gewicht: {option.max_weight} kg</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditOption(option)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteOptionMutation.mutate(option.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}