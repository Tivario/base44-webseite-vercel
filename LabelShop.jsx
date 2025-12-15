import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, Globe, Phone, Mail, ExternalLink, Instagram, 
  Building2, FileText, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import ProductGrid from '../components/products/ProductGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function LabelShop() {
  const urlParams = new URLSearchParams(window.location.search);
  const sellerEmail = urlParams.get('seller');

  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
      loadFavorites(userData.email);
    } catch (e) {}
  };

  const loadFavorites = async (email) => {
    try {
      const favs = await base44.entities.Favorite.filter({ user_email: email });
      setFavorites(favs);
    } catch (e) {}
  };

  const { data: seller, isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', sellerEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: sellerEmail });
      return users[0];
    },
    enabled: !!sellerEmail,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['label-products', sellerEmail],
    queryFn: () => base44.entities.Product.filter({ seller_email: sellerEmail, status: 'aktiv' }, '-created_date'),
    enabled: !!sellerEmail,
  });

  if (!sellerEmail || loadingSeller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Lade Label-Shop...</p>
      </div>
    );
  }

  if (!seller?.is_business) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Dieser Verkäufer hat keinen Label-Shop.</p>
        <Link to={createPageUrl('Home')}>
          <Button className="mt-4 bg-[#A8D5F2] hover:bg-[#7AB8E8]">
            Zurück zur Startseite
          </Button>
        </Link>
      </div>
    );
  }

  const business = seller.business_info || {};

  return (
    <div className="min-h-screen bg-[#F8FBFF]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Link to={createPageUrl('Search')}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
        </Link>
      </div>

      {/* Banner */}
      {business.banner && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img src={business.banner} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E0EEF8] -mt-16 relative z-10 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            {business.logo && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0">
                <img src={business.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-3xl font-bold text-[#2A4D66]">
                      {business.company_name}
                    </h1>
                    <Badge className="bg-[#A8D5F2] text-white">
                      <Building2 className="w-3 h-3 mr-1" />
                      Gewerblich
                    </Badge>
                  </div>
                  {business.legal_form && (
                    <p className="text-[#6B8CA8] text-sm">{business.legal_form}</p>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Rechtliche Angaben
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Rechtliche Angaben</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <h3 className="font-semibold text-[#2A4D66] mb-2">Firmeninformationen</h3>
                        <p className="text-sm text-[#6B8CA8]">
                          {business.company_name}<br />
                          {business.legal_form && `${business.legal_form}`}<br />
                          {business.address_street}<br />
                          {business.address_postal} {business.address_city}<br />
                          {business.address_country}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-[#2A4D66] mb-2">Kontakt</h3>
                        <p className="text-sm text-[#6B8CA8]">
                          E-Mail: {business.contact_email}<br />
                          {business.phone && `Telefon: ${business.phone}`}<br />
                          {business.vat_id && `USt-ID: ${business.vat_id}`}
                        </p>
                      </div>
                      {business.imprint_url && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-[#2A4D66] mb-2">Impressum</h3>
                            <a href={business.imprint_url} target="_blank" rel="noopener noreferrer" className="text-[#7AB8E8] hover:underline text-sm flex items-center gap-1">
                              Zum Impressum
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </>
                      )}
                      {business.terms_url && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-[#2A4D66] mb-2">AGB</h3>
                            <a href={business.terms_url} target="_blank" rel="noopener noreferrer" className="text-[#7AB8E8] hover:underline text-sm flex items-center gap-1">
                              Zu den AGB
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </>
                      )}
                      {business.return_policy && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-[#2A4D66] mb-2">Widerrufsbelehrung</h3>
                            <p className="text-sm text-[#6B8CA8] whitespace-pre-line">{business.return_policy}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {business.description && (
                <p className="text-[#6B8CA8] mb-4">{business.description}</p>
              )}

              <div className="flex flex-wrap gap-4">
                {business.address_city && (
                  <div className="flex items-center gap-2 text-[#6B8CA8] text-sm">
                    <MapPin className="w-4 h-4" />
                    {business.address_city}, {business.address_country}
                  </div>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#7AB8E8] hover:text-[#6BB5E8] text-sm">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {business.instagram && (
                  <a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#7AB8E8] hover:text-[#6BB5E8] text-sm">
                    <Instagram className="w-4 h-4" />
                    {business.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        <h2 className="font-display text-2xl font-bold text-[#2A4D66] mb-6">
          Alle Artikel ({products?.length || 0})
        </h2>
        <ProductGrid
          products={products || []}
          userEmail={currentUser?.email}
          favorites={favorites}
          onFavoriteChange={() => currentUser && loadFavorites(currentUser.email)}
          loading={loadingProducts}
        />
      </div>

      {/* Legal Notice */}
      <div className="bg-[#EBF5FF] border-t border-[#E0EEF8] py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-start gap-3 text-sm text-[#6B8CA8]">
            <ShieldCheck className="w-5 h-5 text-[#7AB8E8] shrink-0 mt-0.5" />
            <p>
              Der Kaufvertrag kommt direkt zwischen dir und dem gewerblichen Verkäufer zustande. 
              Tivaro stellt nur die Plattform bereit und ist nicht Vertragspartei.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}