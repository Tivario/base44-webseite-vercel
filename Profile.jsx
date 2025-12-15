import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Package, Heart, Settings as SettingsIcon, LogOut, 
  ChevronRight, Award, Wallet, ShoppingBag, TrendingUp,
  Zap, Sliders, Percent, Plane, Gift, UserPlus, BookOpen,
  HelpCircle, Info, FileText, Building2, Shield, Edit, Trash2, 
  Eye, MoreVertical, Plus, BarChart3, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import ProductCard from '../components/products/ProductCard';
import InterestedUsers from '../components/products/InterestedUsers';

const statusLabels = {
  aktiv: { label: 'Aktiv', color: 'bg-green-100 text-green-800' },
  reserviert: { label: 'Reserviert', color: 'bg-yellow-100 text-yellow-800' },
  verkauft: { label: 'Verkauft', color: 'bg-blue-100 text-blue-800' },
  getauscht: { label: 'Getauscht', color: 'bg-purple-100 text-purple-800' },
  deaktiviert: { label: 'Deaktiviert', color: 'bg-gray-100 text-gray-800' },
};

export default function Profile() {
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

  const { data: myProducts, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['my-products', user?.email],
    queryFn: () => base44.entities.Product.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: favorites, isLoading: loadingFavorites, refetch: refetchFavorites } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      const favs = await base44.entities.Favorite.filter({ user_email: user.email });
      const productIds = favs.map(f => f.product_id);
      if (productIds.length === 0) return [];
      const products = await base44.entities.Product.filter({ status: 'aktiv' });
      return products.filter(p => productIds.includes(p.id));
    },
    enabled: !!user,
  });

  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: allBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.filter({ is_active: true }, 'sort_order'),
  });

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await base44.entities.Product.delete(deleteProductId);
      refetchProducts();
    } catch (e) {
      console.error(e);
    }
    setDeleteProductId(null);
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await base44.entities.Product.update(productId, { status: newStatus });
      refetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Profil...</p>
      </div>
    );
  }

  const earnedBadges = userBadges?.length || 0;
  const totalBadges = allBadges?.length || 0;
  const badgeProgress = totalBadges > 0 ? (earnedBadges / totalBadges) * 100 : 0;

  const activeProducts = myProducts?.filter(p => p.status === 'aktiv') || [];
  const soldProducts = myProducts?.filter(p => p.status === 'verkauft' || p.status === 'getauscht') || [];

  const menuItems = [
    { 
      icon: Truck, 
      title: 'DHL Business Integration', 
      subtitle: '📦 NEU: Automatische Label-Erstellung',
      page: 'DHLSettings',
      color: 'text-yellow-500',
      highlight: true
    },
    { 
      icon: Wallet, 
      title: 'Geldbeutel', 
      subtitle: 'Guthaben & Auszahlungen',
      page: 'Wallet',
      color: 'text-emerald-500' 
    },
    { 
      icon: ShoppingBag, 
      title: 'Meine Bestellungen', 
      subtitle: 'Gekaufte Artikel',
      page: 'Orders',
      color: 'text-blue-500' 
    },
    { 
      icon: Package, 
      title: 'Meine Verkäufe', 
      subtitle: 'Verkaufte Artikel',
      page: 'Orders',
      color: 'text-purple-500' 
    },
    { 
      icon: TrendingUp, 
      title: 'Verkaufs-Dashboard', 
      subtitle: 'Statistiken & Insights',
      page: 'Dashboard',
      color: 'text-[#7AB8E8]' 
    },
    { 
      icon: Zap, 
      title: 'Promotion-Tools', 
      subtitle: 'Artikel hervorheben',
      page: 'PromotionTools',
      color: 'text-amber-500' 
    },
    { 
      icon: Sliders, 
      title: 'Personalisierung', 
      subtitle: 'Empfehlungen anpassen',
      page: 'Personalization',
      color: 'text-indigo-500' 
    },
    { 
      icon: Percent, 
      title: 'Rabattcodes', 
      subtitle: 'Bundle-Angebote erstellen',
      page: 'DiscountCodes',
      color: 'text-orange-500' 
    },
    { 
      icon: Plane, 
      title: 'Urlaubsmodus', 
      subtitle: 'Verkäufe pausieren',
      page: 'VacationMode',
      color: 'text-teal-500' 
    },
    { 
      icon: UserPlus, 
      title: 'Freunde einladen', 
      subtitle: 'Referral-Programm',
      page: 'Referral',
      color: 'text-pink-500' 
    },
  ];

  const helpItems = [
    { icon: BookOpen, title: 'Anleitung', page: 'Guide' },
    { icon: HelpCircle, title: 'Hilfe-Center', page: 'HelpCenter' },
    { icon: SettingsIcon, title: 'Einstellungen', page: 'Settings' },
  ];

  const legalItems = [
    { icon: FileText, title: 'Rechtsinformationen', page: 'Legal' },
    { icon: Info, title: 'Über Tivaro', page: 'About' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#EBF5FF]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* User Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 mb-4 border border-[#E0EEF8] shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A8D5F2] to-[#7AB8E8] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.full_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-[#2A4D66] mb-1">
                {user.full_name || 'Nutzer'}
              </h1>
              <p className="text-[#6B8CA8] text-sm">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => base44.auth.logout()}>
              <LogOut className="w-5 h-5 text-[#6B8CA8]" />
            </Button>
          </div>
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-4 bg-white border-[#E0EEF8] shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2A4D66]">Deine Erfolge</h3>
                    <p className="text-sm text-[#6B8CA8]">
                      {earnedBadges} von {totalBadges} Badges
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B8CA8]" />
              </div>
              <Progress value={badgeProgress} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Products & Favorites Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <Tabs defaultValue="products">
            <TabsList className="bg-white border border-[#E0EEF8] p-1 rounded-xl mb-4 w-full">
              <TabsTrigger value="products" className="flex-1 rounded-lg data-[state=active]:bg-[#EBF5FF] gap-2">
                <Package className="w-4 h-4" />
                Meine Artikel ({activeProducts.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 rounded-lg data-[state=active]:bg-[#EBF5FF] gap-2">
                <Heart className="w-4 h-4" />
                Favoriten ({favorites?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Link to={createPageUrl('Dashboard')}>
                    <Button variant="outline" size="sm" className="border-[#A8D5F2] text-[#7AB8E8]">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Orders')}>
                    <Button variant="outline" size="sm" className="border-[#E0EEF8]">
                      <Package className="w-4 h-4 mr-2" />
                      Bestellungen
                    </Button>
                  </Link>
                </div>
                <Link to={createPageUrl('CreateProduct')}>
                  <Button size="sm" className="bg-gradient-to-r from-[#7AB8E8] to-[#A8D5F2] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Verkaufen
                  </Button>
                </Link>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6B8CA8]">Kein Bild</div>
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

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                              <Eye className="w-3 h-3" />
                              {product.views || 0}
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                              <Heart className="w-3 h-3" />
                              {product.favorites_count || 0}
                            </div>
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
                          {product.favorites_count > 0 && (
                            <div className="mt-3">
                              <InterestedUsers product={product} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {loadingFavorites ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-[#EBF5FF] rounded-2xl mb-3" />
                      <div className="h-4 bg-[#EBF5FF] rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : favorites?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E0EEF8]">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#EBF5FF] flex items-center justify-center">
                    <Heart className="w-10 h-10 text-[#6B8CA8]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Keine Favoriten</h3>
                  <p className="text-[#6B8CA8] mb-6">Speichere Artikel, die dir gefallen</p>
                  <Link to={createPageUrl('Search')}>
                    <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                      Artikel entdecken
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favorites.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      userEmail={user?.email}
                      isFavorited={true}
                      onFavoriteChange={refetchFavorites}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Main Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-[#E0EEF8] shadow-lg mb-4 overflow-hidden"
        >
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-4 p-4 hover:bg-[#F8FBFF] transition-colors border-b border-[#E0EEF8] last:border-0 ${item.highlight ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color === 'text-yellow-500' ? 'from-yellow-400 to-amber-500' : item.color === 'text-red-500' ? 'from-red-500 to-pink-600' : item.color === 'text-emerald-500' ? 'from-emerald-500 to-teal-600' : item.color === 'text-blue-500' ? 'from-blue-500 to-indigo-600' : item.color === 'text-purple-500' ? 'from-purple-500 to-violet-600' : item.color === 'text-[#7AB8E8]' ? 'from-[#7AB8E8] to-[#A8D5F2]' : item.color === 'text-amber-500' ? 'from-amber-500 to-orange-600' : item.color === 'text-indigo-500' ? 'from-indigo-500 to-purple-600' : item.color === 'text-orange-500' ? 'from-orange-500 to-red-600' : item.color === 'text-teal-500' ? 'from-teal-500 to-cyan-600' : 'from-pink-500 to-rose-600'} flex items-center justify-center shadow-md`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${item.highlight ? 'text-yellow-900' : 'text-[#2A4D66]'}`}>{item.title}</p>
                <p className={`text-sm ${item.highlight ? 'text-yellow-800' : 'text-[#6B8CA8]'}`}>{item.subtitle}</p>
              </div>
              {item.highlight && (
                <Badge className="bg-yellow-400 text-yellow-900 text-xs mr-2">NEU</Badge>
              )}
              <ChevronRight className="w-5 h-5 text-[#6B8CA8]" />
            </Link>
          ))}
        </motion.div>

        {/* Help & Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-[#E0EEF8] shadow-lg mb-4 overflow-hidden"
        >
          {helpItems.map((item, idx) => (
            <Link
              key={idx}
              to={createPageUrl(item.page)}
              className="flex items-center gap-4 p-4 hover:bg-[#F8FBFF] transition-colors border-b border-[#E0EEF8] last:border-0"
            >
              <item.icon className="w-5 h-5 text-[#6B8CA8]" />
              <p className="flex-1 font-medium text-[#2A4D66]">{item.title}</p>
              <ChevronRight className="w-5 h-5 text-[#6B8CA8]" />
            </Link>
          ))}
        </motion.div>

        {/* Legal & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-[#E0EEF8] shadow-lg mb-20 overflow-hidden"
        >
          {legalItems.map((item, idx) => (
            <Link
              key={idx}
              to={createPageUrl(item.page)}
              className="flex items-center gap-4 p-4 hover:bg-[#F8FBFF] transition-colors border-b border-[#E0EEF8] last:border-0"
            >
              <item.icon className="w-5 h-5 text-[#6B8CA8]" />
              <p className="flex-1 font-medium text-[#2A4D66]">{item.title}</p>
              <ChevronRight className="w-5 h-5 text-[#6B8CA8]" />
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Delete Dialog */}
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