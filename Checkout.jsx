import React, { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, MapPin, CreditCard, Check, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ShippingSelector from '../components/shipping/ShippingSelector';
import DiscountCodeInput from '../components/checkout/DiscountCodeInput';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Checkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  const [user, setUser] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [address, setAddress] = useState({
    name: '',
    street: '',
    postal: '',
    city: '',
    country: 'DE',
  });
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'paypal'

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      // Load saved address if available
      if (userData.shipping_address) {
        setAddress(userData.shipping_address);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const handleCheckout = async () => {
    if (!selectedShipping) {
      toast.error('Bitte wähle eine Versandart');
      return;
    }
    if (!address.name || !address.street || !address.postal || !address.city) {
      toast.error('Bitte fülle alle Adressfelder aus');
      return;
    }

    setProcessing(true);
    try {
      // Calculate fees
      const fixedProtectionFee = 1.00;
      const protectionFeePercent = 0.05;
      const buyerProtectionFee = fixedProtectionFee + (product.price * protectionFeePercent);
      
      const buyerShippingPrice = selectedShipping.buyer_shipping_price || selectedShipping.price;
      const carrierCost = selectedShipping.carrier_cost || 0;
      const shippingMargin = selectedShipping.shipping_margin || (buyerShippingPrice - carrierCost);
      
      const itemPrice = product.price;
      const totalPrice = itemPrice + buyerShippingPrice + buyerProtectionFee;
      const sellerPayout = itemPrice;
      const platformFee = buyerProtectionFee + shippingMargin;

      // Calculate deadlines
      const shippingDeadline = new Date();
      shippingDeadline.setDate(shippingDeadline.getDate() + 5); // 5 Werktage

      // Create transaction
      const transaction = await base44.entities.Transaction.create({
        product_id: product.id,
        product_title: product.title,
        seller_email: product.seller_email,
        buyer_email: user.email,
        type: 'verkauf',
        item_price: itemPrice,
        buyer_protection_fee: buyerProtectionFee,
        shipping_price: buyerShippingPrice,
        shipping_margin: shippingMargin,
        total_price: totalPrice,
        seller_payout: sellerPayout,
        platform_fee: platformFee,
        amount: totalPrice,
        fee: platformFee,
        net_amount: sellerPayout,
        original_price: product.original_price,
        status: 'pending',
        shipping_method: selectedShipping.carrier,
        shipping_deadline: shippingDeadline.toISOString(),
        buyer_address: address,
      });

      // Save address
      await base44.auth.updateMe({ shipping_address: address });

      // Process Payment
      if (paymentMethod === 'stripe' || paymentMethod === 'sofort' || paymentMethod === 'giropay') {
        await handleStripePayment(transaction, paymentMethod);
      } else if (paymentMethod === 'paypal') {
        await handlePayPalPayment(transaction);
      }

    } catch (err) {
      console.error(err);
      toast.error('Fehler beim Abschließen der Bestellung');
      setProcessing(false);
    }
  };

  const handleStripePayment = async (transaction, method = 'stripe') => {
    try {
      const result = await base44.functions.call('create-payment-intent', {
        transaction_id: transaction.id
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.loading('Zahlung wird verarbeitet...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      await base44.functions.call('confirm-payment', {
        transaction_id: transaction.id,
        payment_method: method,
        payment_id: result.payment_intent_id
      });

      await finalizeOrder(transaction);

    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Zahlung fehlgeschlagen');
      setProcessing(false);
    }
  };

  const handlePayPalPayment = async (transaction) => {
    try {
      const result = await base44.functions.call('create-paypal-order', {
        transaction_id: transaction.id
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // In production: Redirect to PayPal or use PayPal SDK
      toast.loading('Zahlung wird verarbeitet...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      await base44.functions.call('confirm-payment', {
        transaction_id: transaction.id,
        payment_method: 'paypal',
        payment_id: result.order_id
      });

      await finalizeOrder(transaction);

    } catch (error) {
      console.error('PayPal Payment Error:', error);
      toast.error('PayPal-Zahlung fehlgeschlagen');
      setProcessing(false);
    }
  };

  const finalizeOrder = async (transaction) => {
    // Update product status
    await base44.entities.Product.update(product.id, { status: 'verkauft' });

    // Add to seller's pending balance
    const seller = await base44.entities.User.filter({ email: product.seller_email });
    if (seller.length > 0) {
      const sellerUser = seller[0];
      await base44.entities.User.update(sellerUser.id, {
        pending_balance: (sellerUser.pending_balance || 0) + transaction.seller_payout
      });
    }

    // Send confirmation emails with invoices
    try {
      const invoiceText = `RECHNUNG #${transaction.id}
    Datum: ${new Date().toLocaleDateString('de-DE')}

    Von: Tivario GmbH

    An: ${user.full_name || user.email}

    Artikel: ${product.title}
    Artikelpreis: ${transaction.item_price?.toFixed(2)} €
    Versand: ${transaction.shipping_price?.toFixed(2)} €
    Käuferschutz: ${transaction.buyer_protection_fee?.toFixed(2)} €

    Gesamtbetrag: ${transaction.total_price?.toFixed(2)} €
    inkl. 19% MwSt.: ${(transaction.total_price * 0.19 / 1.19).toFixed(2)} €`;

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Bestellbestätigung - ${product.title}`,
        body: `Hallo,\n\ndeine Bestellung wurde erfolgreich bezahlt!\n\nArtikel: ${product.title}\nPreis: ${transaction.total_price.toFixed(2)} €\nBestellnummer: #${transaction.id}\n\nDer Verkäufer wird benachrichtigt und bereitet den Versand vor.\n\nRechnung im Anhang.\n\nViele Grüße\nDein Tivario Team\n\n---\n\n${invoiceText}`
      });

      await base44.integrations.Core.SendEmail({
        to: product.seller_email,
        subject: `Neuer Verkauf - ${product.title}`,
        body: `Glückwunsch!\n\nDu hast einen Verkauf getätigt:\n\nArtikel: ${product.title}\nPreis: ${transaction.item_price?.toFixed(2)} €\nAuszahlung: ${transaction.seller_payout?.toFixed(2)} €\n\nBitte bereite den Versand vor und lade das Label in deinen Bestellungen hoch.\n\nViele Grüße\nDein Tivario Team`
      });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
    }

    toast.success('Bestellung erfolgreich!');
    setTimeout(() => {
      window.location.href = createPageUrl(`OrderDetail?id=${transaction.id}`);
    }, 1000);
  };

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Produkt wird geladen...</p>
      </div>
    );
  }

  const itemPrice = product.price || 0;
  const buyerShippingPrice = selectedShipping?.buyer_shipping_price || selectedShipping?.price || 0;
  const fixedProtectionFee = 1.00;
  const protectionFeePercent = 0.05;
  const buyerProtectionFee = fixedProtectionFee + (itemPrice * protectionFeePercent);
  const discountAmount = discount?.amount || 0;
  const total = Math.max(0, itemPrice + buyerShippingPrice + buyerProtectionFee - discountAmount);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="inline-flex items-center gap-2 text-[#6B8CA8] hover:text-[#2A4D66] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück zum Artikel
      </Link>

      <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Lieferadresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#2A4D66]">Name</Label>
                <Input
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  placeholder="Vor- und Nachname"
                  className="mt-1.5 border-[#E0EEF8]"
                />
              </div>
              <div>
                <Label className="text-[#2A4D66]">Straße und Hausnummer</Label>
                <Input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Musterstraße 123"
                  className="mt-1.5 border-[#E0EEF8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#2A4D66]">PLZ</Label>
                  <Input
                    value={address.postal}
                    onChange={(e) => setAddress({ ...address, postal: e.target.value })}
                    placeholder="10115"
                    className="mt-1.5 border-[#E0EEF8]"
                  />
                </div>
                <div>
                  <Label className="text-[#2A4D66]">Stadt</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Berlin"
                    className="mt-1.5 border-[#E0EEF8]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Versandart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingSelector
                onSelect={setSelectedShipping}
                selectedOption={selectedShipping}
              />
            </CardContent>
          </Card>

          {/* Discount Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Rabattcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DiscountCodeInput
                product={product}
                onApplyDiscount={setDiscount}
                currentDiscount={discount}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Zahlungsart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-[#A8D5F2] bg-[#EBF5FF]'
                    : 'border-[#E0EEF8] bg-white hover:border-[#A8D5F2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#635BFF] to-[#5469FF] flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#2A4D66]">Karte / SEPA</p>
                      <p className="text-xs text-[#6B8CA8]">Visa, Mastercard, Amex, Lastschrift</p>
                    </div>
                  </div>
                  {paymentMethod === 'stripe' && (
                    <Check className="w-5 h-5 text-[#A8D5F2]" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-[#A8D5F2] bg-[#EBF5FF]'
                    : 'border-[#E0EEF8] bg-white hover:border-[#A8D5F2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0070BA] to-[#1546A0] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42c-.043.215-.088.437-.135.665-.959 4.687-4.152 6.278-7.754 6.278h-1.975c-.413 0-.761.3-.825.705l-.882 5.591a.547.547 0 0 0 .541.632h3.788a.77.77 0 0 0 .759-.648l.031-.162.604-3.83.039-.212a.77.77 0 0 1 .759-.648h.477c3.474 0 6.193-1.415 6.988-5.506.332-1.71.16-3.137-.676-4.133a3.423 3.423 0 0 0-.939-.732z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#2A4D66]">PayPal</p>
                      <p className="text-xs text-[#6B8CA8]">PayPal-Konto oder Karte</p>
                    </div>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <Check className="w-5 h-5 text-[#A8D5F2]" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('sofort')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'sofort'
                    ? 'border-[#A8D5F2] bg-[#EBF5FF]'
                    : 'border-[#E0EEF8] bg-white hover:border-[#A8D5F2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ED6C6C] to-[#ED4F4F] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#2A4D66]">Sofortüberweisung</p>
                      <p className="text-xs text-[#6B8CA8]">Direkt vom Bankkonto</p>
                    </div>
                  </div>
                  {paymentMethod === 'sofort' && (
                    <Check className="w-5 h-5 text-[#A8D5F2]" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('giropay')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'giropay'
                    ? 'border-[#A8D5F2] bg-[#EBF5FF]'
                    : 'border-[#E0EEF8] bg-white hover:border-[#A8D5F2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003B7E] to-[#00509E] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#2A4D66]">giropay</p>
                      <p className="text-xs text-[#6B8CA8]">Sicher mit Online-Banking</p>
                    </div>
                  </div>
                  {paymentMethod === 'giropay' && (
                    <Check className="w-5 h-5 text-[#A8D5F2]" />
                  )}
                </div>
              </button>

              <div className="pt-3 border-t border-[#E0EEF8]">
                <p className="text-xs text-[#6B8CA8] flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  Alle Zahlungen sind SSL-verschlüsselt und sicher
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Bestellübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product */}
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#EBF5FF] shrink-0">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2A4D66] truncate">{product.title}</p>
                  <p className="text-sm text-[#6B8CA8]">{product.brand}</p>
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-[#6B8CA8]">
                  <span>Artikel</span>
                  <span>{itemPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-[#6B8CA8]">
                  <span>Käuferschutzgebühr</span>
                  <span>{buyerProtectionFee.toFixed(2)} €</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between text-[#6B8CA8]">
                    <span>Versand</span>
                    <span>{buyerShippingPrice.toFixed(2)} €</span>
                  </div>
                )}
                {discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Rabatt ({discount.code})</span>
                    <span>-{discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold text-[#2A4D66]">
                  <span>Gesamt</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing || !selectedShipping}
                className="w-full h-12 bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zahlung läuft...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Jetzt kaufen
                  </>
                )}
              </Button>

              <div className="space-y-2 pt-3 border-t border-[#E0EEF8]">
                <p className="text-xs text-[#6B8CA8] text-center flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  Käuferschutz inklusive
                </p>
                <p className="text-xs text-[#6B8CA8] text-center">
                  <Link to={createPageUrl('Widerruf')} className="text-[#7AB8E8] hover:underline">
                    14 Tage Widerrufsrecht
                  </Link>
                  {' • '}
                  <Link to={createPageUrl('Legal')} className="text-[#7AB8E8] hover:underline">
                    AGB
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}