import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, ArrowRightLeft, MapPin, MessageCircle, Share2, 
  ChevronLeft, ChevronRight, Shield, Truck, Package, User,
  Eye, Heart as HeartFilled, Calendar, ShoppingCart, Building2,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import OfferDialog from '../components/offers/OfferDialog';
import AuthBadge from '../components/products/AuthBadge';
import ReportDialog from '../components/reports/ReportDialog';
import ReviewsList from '../components/reviews/ReviewsList';

const conditionLabels = {
  neu_mit_etikett: 'Neu mit Etikett',
  neu_ohne_etikett: 'Neu ohne Etikett',
  sehr_gut: 'Sehr gut',
  gut: 'Gut',
  akzeptabel: 'Akzeptabel'
};

const categoryLabels = {
  oberteile: 'Oberteile',
  hosen: 'Hosen',
  kleider: 'Kleider',
  schuhe: 'Schuhe',
  jacken: 'Jacken',
  accessoires: 'Accessoires',
  taschen: 'Taschen',
  sportswear: 'Sportswear',
  elektronik: 'Elektronik',
  lifestyle: 'Lifestyle',
  sonstiges: 'Sonstiges'
};

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [currentImage, setCurrentImage] = useState(0);
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [selectedTradeProduct, setSelectedTradeProduct] = useState(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      const product = products[0];
      
      // Increment views
      if (product) {
        await base44.entities.Product.update(product.id, {
          views: (product.views || 0) + 1
        });
      }
      
      return product;
    },
    enabled: !!productId,
  });

  const { data: seller } = useQuery({
    queryKey: ['seller', product?.seller_email],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: product.seller_email });
      return users[0];
    },
    enabled: !!product?.seller_email,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.seller_email],
    queryFn: () => base44.entities.Review.filter({ seller_email: product.seller_email }, '-created_date'),
    enabled: !!product?.seller_email,
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && productId) {
      checkFavorite();
      loadUserProducts();
    }
  }, [user, productId]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {}
  };

  const checkFavorite = async () => {
    try {
      const favs = await base44.entities.Favorite.filter({ 
        product_id: productId, 
        user_email: user.email 
      });
      setIsFavorited(favs.length > 0);
    } catch (e) {}
  };

  const loadUserProducts = async () => {
    try {
      const prods = await base44.entities.Product.filter({ 
        seller_email: user.email,
        status: 'aktiv'
      });
      setUserProducts(prods);
    } catch (e) {}
  };

  const handleFavorite = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    try {
      if (isFavorited) {
        const favs = await base44.entities.Favorite.filter({ 
          product_id: productId, 
          user_email: user.email 
        });
        if (favs.length > 0) {
          await base44.entities.Favorite.delete(favs[0].id);
        }
      } else {
        await base44.entities.Favorite.create({
          product_id: productId,
          user_email: user.email
        });
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error(err);
    }
  };

  const startConversation = async (type = 'kauf') => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    // Check if conversation already exists
    const existing = await base44.entities.Conversation.filter({
      product_id: productId,
      buyer_email: user.email
    });

    let conversationId;
    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      const conv = await base44.entities.Conversation.create({
        product_id: productId,
        product_title: product.title,
        product_image: product.images?.[0] || '',
        seller_email: product.seller_email,
        buyer_email: user.email,
        type: type,
        trade_offer_product_id: selectedTradeProduct?.id || '',
        trade_offer_product_title: selectedTradeProduct?.title || '',
        status: 'aktiv',
        last_message: type === 'tausch' 
          ? `Tauschanfrage: ${selectedTradeProduct?.title || 'Artikel'}` 
          : 'Neue Nachricht',
        last_message_date: new Date().toISOString()
      });
      conversationId = conv.id;

      // Create initial message
      const messageContent = type === 'tausch'
        ? `Hallo! Ich würde gerne "${selectedTradeProduct?.title}" gegen "${product.title}" tauschen. Hast du Interesse?`
        : `Hallo! Ich interessiere mich für "${product.title}". Ist der Artikel noch verfügbar?`;

      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        content: messageContent,
        type: type === 'tausch' ? 'trade_offer' : 'text',
        trade_product_id: selectedTradeProduct?.id || ''
      });
    }

    window.location.href = createPageUrl(`Chat?id=${conversationId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-[#EBF5FF] rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-[#EBF5FF] rounded w-3/4" />
              <div className="h-6 bg-[#EBF5FF] rounded w-1/4" />
              <div className="h-24 bg-[#EBF5FF] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-[#2A4D66] mb-4">Artikel nicht gefunden</h2>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">Zurück zur Startseite</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [null];
  const canTrade = product.trade_option === 'nur_tausch' || product.trade_option === 'verkauf_oder_tausch';
  const isOwner = user?.email === product.seller_email;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6B8CA8] mb-6">
        <Link to={createPageUrl('Home')} className="hover:text-[#A8D5F2]">Home</Link>
        <span>/</span>
        <Link to={createPageUrl('Search')} className="hover:text-[#A8D5F2]">Suchen</Link>
        <span>/</span>
        <span className="text-[#2A4D66]">{product.title}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-[#EBF5FF] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                alt={product.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-[#2A4D66]" />
                </button>
                <button
                  onClick={() => setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg"
                >
                  <ChevronRight className="w-5 h-5 text-[#2A4D66]" />
                </button>
              </>
            )}

            {/* Trade Badge */}
            {canTrade && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-[#2A4D66] text-white gap-1 px-3 py-1">
                  <ArrowRightLeft className="w-4 h-4" />
                  Tausch möglich
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImage === idx ? 'border-[#A8D5F2]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-[#6B8CA8] uppercase tracking-wide text-sm mb-2">
              {product.brand || 'Keine Marke'}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#2A4D66] mb-4">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3">
              {product.trade_option === 'nur_tausch' ? (
                <span className="text-2xl font-bold text-[#A8D5F2]">Nur Tausch</span>
              ) : (
                <span className="text-3xl font-bold text-[#A8D5F2]">{product.price?.toFixed(2)} €</span>
              )}
            </div>
          </div>

          {/* Authentication Badge */}
          {product.is_high_value_brand && (
            <div className="mb-4">
              <AuthBadge status={product.auth_status} size="large" showDescription={true} />
            </div>
          )}

          {/* Quick Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-[#EBF5FF] text-[#2A4D66]">
              {conditionLabels[product.condition]}
            </Badge>
            {product.size && (
              <Badge variant="secondary" className="bg-[#EBF5FF] text-[#2A4D66]">
                Größe {product.size}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-[#EBF5FF] text-[#2A4D66]">
              {categoryLabels[product.category] || product.category}
            </Badge>
            {product.gender && (
              <Badge variant="secondary" className="bg-[#EBF5FF] text-[#2A4D66]">
                {product.gender === 'damen' ? 'Damen' : product.gender === 'herren' ? 'Herren' : product.gender === 'unisex' ? 'Unisex' : 'Kinder'}
              </Badge>
            )}
          </div>

            {/* Product Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B8CA8]">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{product.views || 0} Aufrufe</span>
            </div>
            <div className="flex items-center gap-1">
              <HeartFilled className="w-4 h-4" />
              <span>{product.favorites_count || 0} Favoriten</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Hochgeladen am {new Date(product.created_date).toLocaleDateString('de-DE')}</span>
            </div>
            </div>

          {/* Location */}
          {product.location_city && (
            <div className="flex items-center gap-2 text-[#6B8CA8]">
              <MapPin className="w-4 h-4" />
              <span>{product.location_city}{product.location_country ? `, ${product.location_country}` : ''}</span>
            </div>
          )}

          <Separator />

          {/* Seller Info */}
          {seller?.is_business && (
            <div className="bg-[#EBF5FF] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#7AB8E8]" />
                  <span className="font-semibold text-[#2A4D66]">Gewerblicher Verkäufer</span>
                </div>
                <Link to={createPageUrl(`LabelShop?seller=${seller.email}`)}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Zum Shop
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-[#6B8CA8]">
                {seller.business_info?.company_name}
              </p>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-display font-semibold text-[#2A4D66] mb-3">Beschreibung</h3>
            <p className="text-[#6B8CA8] leading-relaxed whitespace-pre-line">
              {product.description || 'Keine Beschreibung vorhanden.'}
            </p>
          </div>

          {/* Trade Preferences */}
          {canTrade && product.trade_preferences && (
            <div className="bg-[#EBF5FF] rounded-xl p-4">
              <h4 className="font-medium text-[#2A4D66] mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#7AB8E8]" />
                Tauschwünsche
              </h4>
              <p className="text-[#6B8CA8] text-sm">{product.trade_preferences}</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          {!isOwner && (
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                {/* Sofort kaufen Button */}
                {product.instant_buy_enabled && product.trade_option !== 'nur_tausch' && (
                  <Button 
                    className="flex-1 min-w-[200px] h-14 bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white text-lg rounded-xl"
                    onClick={() => {
                      if (!user) {
                        base44.auth.redirectToLogin();
                        return;
                      }
                      window.location.href = createPageUrl(`Checkout?product=${product.id}`);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Jetzt kaufen
                  </Button>
                )}

                {/* Preisvorschlag Button */}
                {product.negotiation_enabled && product.trade_option !== 'nur_tausch' && (
                  <OfferDialog product={product} user={user}>
                    <Button 
                      className="flex-1 min-w-[200px] h-14 bg-white border-2 border-[#7AB8E8] text-[#7AB8E8] hover:bg-[#EBF5FF] text-lg rounded-xl"
                    >
                      <TrendingDown className="w-5 h-5 mr-2" />
                      Preis vorschlagen
                    </Button>
                  </OfferDialog>
                )}

                {/* Nachricht senden Button - immer verfügbar */}
                {product.trade_option !== 'nur_tausch' && (
                  <Button 
                    className="flex-1 min-w-[200px] h-14 bg-white border-2 border-[#A8D5F2] text-[#2A4D66] hover:bg-[#EBF5FF] text-lg rounded-xl"
                    onClick={() => startConversation('kauf')}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Nachricht senden
                  </Button>
                )}

                {/* Tauschen Button */}
                {canTrade && (
                  <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`${product.trade_option === 'nur_tausch' ? 'flex-1' : ''} h-14 border-[#2A4D66] text-[#2A4D66] hover:bg-[#2A4D66] hover:text-white text-lg rounded-xl`}
                      >
                        <ArrowRightLeft className="w-5 h-5 mr-2" />
                        Tauschen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display text-xl">Tauschanfrage senden</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-[#6B8CA8] mb-4">Wähle einen deiner Artikel zum Tauschen:</p>
                        {userProducts.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-[#6B8CA8] mb-4">Du hast noch keine Artikel eingestellt.</p>
                            <Link to={createPageUrl('CreateProduct')}>
                              <Button className="bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                                Artikel einstellen
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {userProducts.map(p => (
                              <button
                                key={p.id}
                                onClick={() => setSelectedTradeProduct(p)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                                  selectedTradeProduct?.id === p.id 
                                    ? 'border-[#A8D5F2] bg-[#A8D5F2]/5' 
                                    : 'border-[#E0EEF8] hover:border-[#A8D5F2]'
                                }`}
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#EBF5FF] shrink-0">
                                  {p.images?.[0] && (
                                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-[#2A4D66]">{p.title}</p>
                                  <p className="text-sm text-[#6B8CA8]">{p.price?.toFixed(2)} €</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedTradeProduct && (
                          <Button 
                            className="w-full mt-4 bg-[#A8D5F2] hover:bg-[#7AB8E8]"
                            onClick={() => {
                              setShowTradeDialog(false);
                              startConversation('tausch');
                            }}
                          >
                            Tauschanfrage senden
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-[#E0EEF8] text-[#2A4D66] rounded-xl"
                  onClick={handleFavorite}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorited ? 'Gespeichert' : 'Speichern'}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-[#E0EEF8] text-[#2A4D66] rounded-xl px-4"
                  onClick={() => navigator.share?.({ url: window.location.href, title: product.title })}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="bg-[#EBF5FF] rounded-xl p-4">
              <p className="text-[#6B8CA8] text-center mb-3">Dies ist dein Artikel</p>
              <div className="space-y-2">
                <Link to={createPageUrl('Profile')}>
                  <Button variant="outline" className="w-full border-[#E0EEF8]">
                    Artikel verwalten
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Trust Signals */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: Shield, text: 'Sicherer Kauf' },
              { icon: Truck, text: 'Schneller Versand' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[#6B8CA8]">
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Report Button */}
          {!isOwner && user && (
            <div className="pt-4 border-t border-[#E0EEF8]">
              <ReportDialog
                productId={product.id}
                productTitle={product.title}
                sellerEmail={product.seller_email}
                userEmail={user.email}
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Sicherheitshinweis:</strong> Kaufe nur über die Plattform. Bei verdächtigem Verhalten melde den Artikel.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[#2A4D66] mb-6">
            Verkäufer-Bewertungen
          </h2>
          <ReviewsList reviews={reviews} />
        </div>
      )}
    </div>
  );
}