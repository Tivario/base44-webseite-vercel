import React, { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, X, ImagePlus, ArrowRightLeft, Package, 
  MapPin, Tag, Loader2, Check, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
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
  { value: 'neu_mit_etikett', label: 'Neu mit Etikett' },
  { value: 'neu_ohne_etikett', label: 'Neu ohne Etikett' },
  { value: 'sehr_gut', label: 'Sehr gut' },
  { value: 'gut', label: 'Gut' },
  { value: 'akzeptabel', label: 'Akzeptabel' },
];

const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '32', '34', '36', '38', '40', '42', '44', '46', 'One Size'];

export default function EditProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    currency: 'EUR',
    category: '',
    size: '',
    brand: '',
    condition: '',
    gender: 'unisex',
    color: '',
    trade_option: 'nur_verkauf',
    trade_preferences: '',
    location_city: '',
    location_country: 'Deutschland',
    location_postal: '',
    shipping_available: true,
    pickup_available: false,
    instant_buy_enabled: true,
    negotiation_enabled: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-edit', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (product && user) {
      if (product.seller_email !== user.email) {
        window.location.href = createPageUrl('Profile');
        return;
      }
      
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        currency: product.currency || 'EUR',
        category: product.category || '',
        size: product.size || '',
        brand: product.brand || '',
        condition: product.condition || '',
        gender: product.gender || 'unisex',
        color: product.color || '',
        trade_option: product.trade_option || 'nur_verkauf',
        trade_preferences: product.trade_preferences || '',
        location_city: product.location_city || '',
        location_country: product.location_country || 'Deutschland',
        location_postal: product.location_postal || '',
        shipping_available: product.shipping_available !== false,
        pickup_available: product.pickup_available || false,
        instant_buy_enabled: product.instant_buy_enabled !== false,
        negotiation_enabled: product.negotiation_enabled !== false,
      });
      setImages(product.images || []);
    }
  }, [product, user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.update(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-edit']);
      queryClient.invalidateQueries(['my-products']);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = createPageUrl('Profile');
      }, 1500);
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('Maximal 5 Bilder erlaubt');
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setImages(prev => [...prev, file_url]);
      }
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (images.length === 0) {
      alert('Bitte mindestens ein Bild hochladen');
      return;
    }

    if (!formData.title || !formData.category || !formData.condition || !formData.brand) {
      alert('Bitte alle Pflichtfelder ausfüllen (Titel, Kategorie, Marke, Zustand)');
      return;
    }

    if (formData.description.length < 10) {
      alert('Bitte gib eine aussagekräftige Beschreibung ein (mindestens 10 Zeichen)');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Bitte gib einen gültigen Preis ein');
      return;
    }

    updateMutation.mutate({
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      currency: formData.currency || 'EUR',
      images,
      instant_buy_enabled: formData.instant_buy_enabled,
      negotiation_enabled: formData.negotiation_enabled,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#EBF5FF] rounded w-1/3" />
          <div className="h-64 bg-[#EBF5FF] rounded" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#2A4D66] mb-2">
            Artikel aktualisiert!
          </h2>
          <p className="text-[#6B8CA8]">Du wirst weitergeleitet...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Artikel bearbeiten
        </h1>
        <p className="text-[#6B8CA8]">Aktualisiere die Details deines Artikels</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
              <ImagePlus className="w-5 h-5" />
              Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-[#E0EEF8] hover:border-[#A8D5F2] flex flex-col items-center justify-center cursor-pointer transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#A8D5F2] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#6B8CA8] mb-1" />
                      <span className="text-xs text-[#6B8CA8]">Hinzufügen</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-[#6B8CA8] mt-3">
              Maximal 5 Fotos. Erstes Foto ist das Titelbild.
            </p>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
              <Package className="w-5 h-5" />
              Artikeldetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#2A4D66]">Titel *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="z.B. Nike Air Max 90 Sneaker"
                className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
              />
            </div>

            <div>
              <Label className="text-[#2A4D66]">Beschreibung *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Beschreibe deinen Artikel detailliert (mindestens 10 Zeichen)..."
                rows={4}
                className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                required
              />
              <p className="text-xs text-[#6B8CA8] mt-1">
                {formData.description.length} Zeichen (min. 10)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#2A4D66]">Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger className="mt-1.5 border-[#E0EEF8]">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#2A4D66]">Zustand *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(val) => setFormData({...formData, condition: val})}
                >
                  <SelectTrigger className="mt-1.5 border-[#E0EEF8]">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#2A4D66]">Größe</Label>
                <Select
                  value={formData.size}
                  onValueChange={(val) => setFormData({...formData, size: val})}
                >
                  <SelectTrigger className="mt-1.5 border-[#E0EEF8]">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#2A4D66]">Für wen?</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({...formData, gender: val})}
                >
                  <SelectTrigger className="mt-1.5 border-[#E0EEF8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damen">Damen</SelectItem>
                    <SelectItem value="herren">Herren</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                    <SelectItem value="kinder">Kinder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[#2A4D66]">Marke *</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="z.B. Nike, Zara, H&M..."
                className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                required
              />
            </div>
            
            <div>
              <Label className="text-[#2A4D66]">Farbe</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="z.B. Schwarz, Weiß, Blau..."
                className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Trade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
              <Tag className="w-5 h-5" />
              Preis & Tausch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#2A4D66]">Preis (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                />
              </div>
              <div>
                <Label className="text-[#2A4D66]">
                  Einkaufspreis (optional)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  placeholder="0.00"
                  className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#2A4D66] mb-3 block">Verkaufs-/Tauschoption</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'nur_verkauf', label: 'Nur Verkauf' },
                  { value: 'nur_tausch', label: 'Nur Tausch' },
                  { value: 'verkauf_oder_tausch', label: 'Beides' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({...formData, trade_option: opt.value})}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.trade_option === opt.value
                        ? 'border-[#A8D5F2] bg-[#A8D5F2]/10 text-[#7AB8E8]'
                        : 'border-[#E0EEF8] text-[#2A4D66] hover:border-[#A8D5F2]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {formData.trade_option !== 'nur_verkauf' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <Label className="text-[#2A4D66]">
                    <ArrowRightLeft className="w-4 h-4 inline mr-2" />
                    Was suchst du zum Tauschen?
                  </Label>
                  <Textarea
                    value={formData.trade_preferences}
                    onChange={(e) => setFormData({...formData, trade_preferences: e.target.value})}
                    placeholder="z.B. Suche Größe M Pullover, Sneaker Größe 42..."
                    rows={2}
                    className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[#2A4D66]">Direktkauf aktivieren</Label>
                <p className="text-sm text-[#6B8CA8]">
                  Käufer können direkt kaufen
                </p>
              </div>
              <Switch
                checked={formData.instant_buy_enabled}
                onCheckedChange={(val) => setFormData({...formData, instant_buy_enabled: val})}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[#2A4D66]">Preisverhandlung erlauben</Label>
                <p className="text-sm text-[#6B8CA8]">
                  Käufer können Preise vorschlagen
                </p>
              </div>
              <Switch
                checked={formData.negotiation_enabled}
                onCheckedChange={(val) => setFormData({...formData, negotiation_enabled: val})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2A4D66]">
              <MapPin className="w-5 h-5" />
              Standort & Versand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#2A4D66]">Stadt</Label>
                <Input
                  value={formData.location_city}
                  onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                  placeholder="z.B. Berlin"
                  className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                />
              </div>
              <div>
                <Label className="text-[#2A4D66]">PLZ</Label>
                <Input
                  value={formData.location_postal}
                  onChange={(e) => setFormData({...formData, location_postal: e.target.value})}
                  placeholder="z.B. 10115"
                  className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#2A4D66]">Land</Label>
              <Input
                value={formData.location_country}
                onChange={(e) => setFormData({...formData, location_country: e.target.value})}
                className="mt-1.5 border-[#E0EEF8] focus:ring-[#A8D5F2]"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[#2A4D66]">Versand möglich</Label>
                <p className="text-sm text-[#6B8CA8]">Artikel kann versendet werden</p>
              </div>
              <Switch
                checked={formData.shipping_available}
                onCheckedChange={(val) => setFormData({...formData, shipping_available: val})}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[#2A4D66]">Abholung möglich</Label>
                <p className="text-sm text-[#6B8CA8]">Artikel kann abgeholt werden</p>
              </div>
              <Switch
                checked={formData.pickup_available}
                onCheckedChange={(val) => setFormData({...formData, pickup_available: val})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full h-14 bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white text-lg rounded-xl"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            'Änderungen speichern'
          )}
        </Button>
      </form>
    </div>
  );
}