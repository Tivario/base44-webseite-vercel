import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, CheckCircle, AlertTriangle, XCircle, 
  Clock, Eye, ChevronRight, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { createPageUrl } from '../utils';

const authStatusConfig = {
  nicht_geprueft: {
    label: 'Nicht geprüft',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  in_pruefung: {
    label: 'In Prüfung',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  verifiziert: {
    label: 'Verifiziert',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  verdaechtig: {
    label: 'Verdächtig',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertTriangle,
  },
  abgelehnt: {
    label: 'Abgelehnt (Fake)',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export default function AdminAuthentication() {
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: productsToReview, isLoading } = useQuery({
    queryKey: ['products-auth-review'],
    queryFn: () => base44.entities.Product.filter({ 
      is_high_value_brand: true 
    }, '-created_date'),
    enabled: !!user,
  });

  const updateAuthStatusMutation = useMutation({
    mutationFn: async ({ productId, newStatus, notes }) => {
      await base44.entities.Product.update(productId, {
        auth_status: newStatus,
        auth_checked_at: new Date().toISOString(),
        auth_checked_by: user.email,
      });
      
      // If rejected/fake, also deactivate the product
      if (newStatus === 'abgelehnt') {
        await base44.entities.Product.update(productId, {
          status: 'deaktiviert'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-auth-review'] });
      setSelectedProduct(null);
      setReviewNotes('');
    },
  });

  const handleStatusChange = (productId, newStatus) => {
    updateAuthStatusMutation.mutate({
      productId,
      newStatus,
      notes: reviewNotes,
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const filterByStatus = (status) => {
    return productsToReview?.filter(p => p.auth_status === status) || [];
  };

  const pendingProducts = filterByStatus('in_pruefung');
  const verifiedProducts = filterByStatus('verifiziert');
  const suspiciousProducts = filterByStatus('verdaechtig');
  const rejectedProducts = filterByStatus('abgelehnt');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#7AB8E8]" />
          Authentifizierungs-Management
        </h1>
        <p className="text-[#6B8CA8]">
          Prüfe und verifiziere Designer-/Luxusmarkenartikel
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'In Prüfung', count: pendingProducts.length, color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          { label: 'Verifiziert', count: verifiedProducts.length, color: 'bg-green-100 text-green-800', icon: CheckCircle },
          { label: 'Verdächtig', count: suspiciousProducts.length, color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
          { label: 'Abgelehnt', count: rejectedProducts.length, color: 'bg-red-100 text-red-800', icon: XCircle },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B8CA8] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#2A4D66]">{stat.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="in_pruefung">
        <TabsList className="bg-[#EBF5FF] p-1 rounded-xl mb-6">
          <TabsTrigger value="in_pruefung" className="rounded-lg data-[state=active]:bg-white">
            <Clock className="w-4 h-4 mr-2" />
            In Prüfung ({pendingProducts.length})
          </TabsTrigger>
          <TabsTrigger value="verifiziert" className="rounded-lg data-[state=active]:bg-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verifiziert ({verifiedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="verdaechtig" className="rounded-lg data-[state=active]:bg-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Verdächtig ({suspiciousProducts.length})
          </TabsTrigger>
          <TabsTrigger value="abgelehnt" className="rounded-lg data-[state=active]:bg-white">
            <XCircle className="w-4 h-4 mr-2" />
            Abgelehnt ({rejectedProducts.length})
          </TabsTrigger>
        </TabsList>

        {['in_pruefung', 'verifiziert', 'verdaechtig', 'abgelehnt'].map(status => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-[#EBF5FF] rounded-2xl mb-3" />
                    <div className="h-4 bg-[#EBF5FF] rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filterByStatus(status).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E0EEF8]">
                <Shield className="w-16 h-16 mx-auto text-[#6B8CA8] mb-4" />
                <p className="text-[#6B8CA8]">Keine Artikel mit diesem Status</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByStatus(status).map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                      <div 
                        className="relative aspect-square bg-[#EBF5FF]"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6B8CA8]">
                            Kein Bild
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className={authStatusConfig[product.auth_status].color}>
                            {authStatusConfig[product.auth_status].label}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-[#6B8CA8] uppercase mb-1">{product.brand}</p>
                        <h3 className="font-medium text-[#2A4D66] truncate mb-2">{product.title}</h3>
                        <p className="font-bold text-[#7AB8E8] mb-3">{product.price?.toFixed(2)} €</p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Prüfen
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Artikel prüfen</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedProduct.images?.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-[#EBF5FF]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-display text-2xl font-bold text-[#2A4D66] mb-2">
                  {selectedProduct.title}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-[#A8D5F2] text-white">{selectedProduct.brand}</Badge>
                  <span className="text-2xl font-bold text-[#7AB8E8]">{selectedProduct.price?.toFixed(2)} €</span>
                </div>
                <p className="text-[#6B8CA8] whitespace-pre-line">{selectedProduct.description}</p>
              </div>

              {/* Current Status */}
              <div className="p-4 rounded-xl bg-[#EBF5FF]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B8CA8] mb-1">Aktueller Status</p>
                    <Badge className={authStatusConfig[selectedProduct.auth_status].color}>
                      {authStatusConfig[selectedProduct.auth_status].label}
                    </Badge>
                  </div>
                  {selectedProduct.auth_checked_at && (
                    <div className="text-right">
                      <p className="text-sm text-[#6B8CA8]">Geprüft am</p>
                      <p className="text-sm font-medium text-[#2A4D66]">
                        {new Date(selectedProduct.auth_checked_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notizen (optional)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Interne Notizen zur Prüfung..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => handleStatusChange(selectedProduct.id, 'verifiziert')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={updateAuthStatusMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verifiziert
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedProduct.id, 'in_pruefung')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={updateAuthStatusMutation.isPending}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  In Prüfung
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedProduct.id, 'verdaechtig')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={updateAuthStatusMutation.isPending}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Verdächtig
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedProduct.id, 'abgelehnt')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={updateAuthStatusMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Ablehnen
                </Button>
              </div>

              {/* Product Link */}
              <div className="pt-4 border-t border-[#E0EEF8]">
                <a
                  href={createPageUrl(`ProductDetail?id=${selectedProduct.id}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7AB8E8] hover:text-[#6BB5E8] flex items-center gap-2"
                >
                  Artikel in neuem Tab öffnen
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}