import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Tag, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function DiscountCodes() {
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    product_id: '',
    min_purchase: '',
    valid_until: '',
    max_uses: '',
    is_active: true
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

  const { data: codes } = useQuery({
    queryKey: ['discount-codes', user?.email],
    queryFn: () => base44.entities.DiscountCode.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.email],
    queryFn: () => base44.entities.Product.filter({ seller_email: user.email, status: 'aktiv' }),
    enabled: !!user,
  });

  const createCodeMutation = useMutation({
    mutationFn: (data) => base44.entities.DiscountCode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discount-codes']);
      toast.success('Rabattcode erstellt!');
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscountCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['discount-codes']);
      toast.success('Rabattcode gelöscht');
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      product_id: '',
      min_purchase: '',
      valid_until: '',
      max_uses: '',
      is_active: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    const validUntil = formData.valid_until ? new Date(formData.valid_until).toISOString() : null;

    createCodeMutation.mutate({
      ...formData,
      code: formData.code.toUpperCase(),
      seller_email: user.email,
      discount_value: parseFloat(formData.discount_value),
      min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_from: new Date().toISOString(),
      valid_until: validUntil,
      current_uses: 0
    });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code kopiert!');
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
            Rabattcodes
          </h1>
          <p className="text-[#6B8CA8]">Erstelle Rabattcodes für deine Artikel</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
              <Plus className="w-4 h-4 mr-2" />
              Code erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuer Rabattcode</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="z.B. SOMMER2024"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rabatt-Typ *</Label>
                  <Select value={formData.discount_type} onValueChange={(val) => setFormData({...formData, discount_type: val})}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Prozent (%)</SelectItem>
                      <SelectItem value="fixed">Betrag (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Wert *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Für bestimmtes Produkt (optional)</Label>
                <Select value={formData.product_id} onValueChange={(val) => setFormData({...formData, product_id: val})}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Alle Produkte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Alle Produkte</SelectItem>
                    {products?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mindestbetrag (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Max. Verwendungen</Label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                    placeholder="Unbegrenzt"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Gültig bis</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                Code erstellen
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {!codes || codes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Tag className="w-12 h-12 mx-auto mb-4 text-[#6B8CA8]" />
              <p className="text-[#6B8CA8]">Noch keine Rabattcodes erstellt</p>
            </CardContent>
          </Card>
        ) : (
          codes.map((code) => {
            const isExpired = code.valid_until && new Date(code.valid_until) < new Date();
            const isMaxed = code.max_uses && code.current_uses >= code.max_uses;
            
            return (
              <Card key={code.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="px-3 py-1 bg-[#EBF5FF] rounded-lg font-mono font-bold text-[#2A4D66]">
                          {code.code}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {code.is_active && !isExpired && !isMaxed ? (
                          <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inaktiv</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[#6B8CA8]">Rabatt</p>
                          <p className="font-medium text-[#2A4D66]">
                            {code.discount_type === 'percentage' 
                              ? `${code.discount_value}%` 
                              : `${code.discount_value.toFixed(2)} €`}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#6B8CA8]">Verwendet</p>
                          <p className="font-medium text-[#2A4D66]">
                            {code.current_uses}{code.max_uses ? `/${code.max_uses}` : ''}
                          </p>
                        </div>
                        {code.min_purchase > 0 && (
                          <div>
                            <p className="text-[#6B8CA8]">Min. Betrag</p>
                            <p className="font-medium text-[#2A4D66]">{code.min_purchase.toFixed(2)} €</p>
                          </div>
                        )}
                        {code.valid_until && (
                          <div>
                            <p className="text-[#6B8CA8]">Gültig bis</p>
                            <p className="font-medium text-[#2A4D66]">
                              {new Date(code.valid_until).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteCodeMutation.mutate(code.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}