import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Edit, Trash2, Eye, MoreVertical, Plus, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusLabels = {
  aktiv: { label: 'Aktiv', color: 'bg-green-100 text-green-800' },
  reserviert: { label: 'Reserviert', color: 'bg-yellow-100 text-yellow-800' },
  verkauft: { label: 'Verkauft', color: 'bg-blue-100 text-blue-800' },
  getauscht: { label: 'Getauscht', color: 'bg-purple-100 text-purple-800' },
  deaktiviert: { label: 'Deaktiviert', color: 'bg-gray-100 text-gray-800' },
};

export default function MyProducts() {
  const [user, setUser] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

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

  const { data: myProducts, isLoading, refetch } = useQuery({
    queryKey: ['my-products', user?.email],
    queryFn: () => base44.entities.Product.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await base44.entities.Product.delete(deleteProductId);
      refetch();
    } catch (e) {
      console.error(e);
    }
    setDeleteProductId(null);
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await base44.entities.Product.update(productId, { status: newStatus });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Artikel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Profile')} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Profil
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">Meine Artikel</h1>
            <p className="text-[#6B8CA8]">{myProducts?.length || 0} Artikel</p>
          </div>
          <Link to={createPageUrl('CreateProduct')}>
            <Button className="bg-gradient-to-r from-[#7AB8E8] to-[#A8D5F2] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Artikel einstellen
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#EBF5FF] rounded-2xl mb-3" />
                <div className="h-4 bg-[#EBF5FF] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : myProducts?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E0EEF8]">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#EBF5FF] flex items-center justify-center">
              <Package className="w-10 h-10 text-[#6B8CA8]" />
            </div>
            <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Noch keine Artikel</h3>
            <p className="text-[#6B8CA8] mb-6">Stelle deinen ersten Artikel ein</p>
            <Link to={createPageUrl('CreateProduct')}>
              <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                <Plus className="w-4 h-4 mr-2" />
                Artikel einstellen
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#E0EEF8] hover:shadow-lg transition-all">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#EBF5FF]">
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
                    
                    <div className="absolute top-3 left-3">
                      <Badge className={statusLabels[product.status]?.color}>
                        {statusLabels[product.status]?.label}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="secondary" className="w-8 h-8 bg-white/90">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="flex items-center gap-2 cursor-pointer">
                              <Eye className="w-4 h-4" />
                              Ansehen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl(`EditProduct?id=${product.id}`)} className="flex items-center gap-2 cursor-pointer">
                              <Edit className="w-4 h-4" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          {product.status === 'aktiv' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'verkauft')}>
                                Als verkauft markieren
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'reserviert')}>
                                Als reserviert markieren
                              </DropdownMenuItem>
                            </>
                          )}
                          {product.status !== 'aktiv' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'aktiv')}>
                              Wieder aktivieren
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteProductId(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-[#6B8CA8] uppercase tracking-wide mb-1">
                      {product.brand || 'Keine Marke'}
                    </p>
                    <h3 className="font-medium text-[#2A4D66] truncate mb-2">
                      {product.title}
                    </h3>
                    <p className="font-bold text-[#7AB8E8]">
                      {product.trade_option === 'nur_tausch' ? 'Nur Tausch' : `${product.price?.toFixed(2)} €`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Artikel wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}