import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Truck, ExternalLink, Upload, CheckCircle2, 
  Clock, AlertCircle, Loader2, Printer
} from 'lucide-react';
import { toast } from 'sonner';

const shippingProviders = {
  dhl: {
    name: 'DHL',
    trackingUrl: 'https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=',
    color: 'bg-yellow-500'
  },
  dpd: {
    name: 'DPD',
    trackingUrl: 'https://tracking.dpd.de/parcelstatus?query=',
    color: 'bg-red-500'
  },
  hermes: {
    name: 'Hermes',
    trackingUrl: 'https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#',
    color: 'bg-blue-500'
  },
  ups: {
    name: 'UPS',
    trackingUrl: 'https://www.ups.com/track?tracknum=',
    color: 'bg-amber-600'
  },
  deutsche_post: {
    name: 'Deutsche Post',
    trackingUrl: 'https://www.deutschepost.de/sendung/simpleQueryResult.html?form.sendungsnummer=',
    color: 'bg-yellow-400'
  },
  abholung: {
    name: 'Persönliche Abholung',
    trackingUrl: null,
    color: 'bg-green-500'
  },
  sonstiges: {
    name: 'Sonstiges',
    trackingUrl: null,
    color: 'bg-gray-500'
  }
};

const statusLabels = {
  pending: { label: 'Ausstehend', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Bezahlt', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  shipped: { label: 'Versendet', icon: Truck, color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Zugestellt', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  completed: { label: 'Abgeschlossen', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Storniert', icon: AlertCircle, color: 'bg-red-100 text-red-800' }
};

export default function ShippingManager({ transaction, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [shippingData, setShippingData] = useState({
    shipping_method: transaction.shipping_method || 'dhl',
    tracking_number: transaction.tracking_number || '',
    tracking_url: transaction.tracking_url || ''
  });

  const handleLabelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLabel(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setShippingData(prev => ({ ...prev, shipping_label_url: file_url }));
      toast.success('Versandlabel hochgeladen');
    } catch (err) {
      toast.error('Fehler beim Hochladen');
    }
    setUploadingLabel(false);
  };

  const handleGenerateLabel = async () => {
    if (!transaction.buyer_address) {
      toast.error('Keine Lieferadresse vorhanden');
      return;
    }

    setGeneratingLabel(true);
    try {
      // Prüfen ob DHL Business aktiv ist
      const user = await base44.auth.me();
      
      if (user.dhl_business_enabled && shippingData.shipping_method === 'dhl') {
        // DHL Business API Label erstellen
        toast.loading('Erstelle DHL Versandlabel...');
        
        // Backend Function aufrufen (wenn Backend Functions aktiviert sind)
        try {
          const result = await base44.functions.call('dhl-create-label', {
            transaction_id: transaction.id
          });
          
          if (result.success) {
            toast.success('DHL Label erstellt! Tracking-Nummer: ' + result.tracking_number);
            onUpdate?.();
            setEditing(false);
          } else {
            throw new Error(result.error);
          }
        } catch (apiError) {
          // Fallback auf manuelles ZPL Label
          console.warn('DHL API nicht verfügbar, verwende ZPL:', apiError);
          generateZPLLabelFallback();
        }
      } else {
        // Standard ZPL Label für Thermodrucker
        generateZPLLabelFallback();
      }
    } catch (err) {
      toast.error('Fehler beim Generieren des Labels');
      console.error(err);
    }
    setGeneratingLabel(false);
  };

  const generateZPLLabelFallback = () => {
    const labelData = generateZPLLabel({
      from: {
        name: 'Verkäufer',
        street: 'Absenderstraße',
        postal: '12345',
        city: 'Stadt',
      },
      to: transaction.buyer_address,
      carrier: shippingProviders[shippingData.shipping_method]?.name || 'DHL',
      trackingNumber: shippingData.tracking_number || '',
      productTitle: transaction.product_title,
    });

    const blob = new Blob([labelData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `versandlabel-${transaction.id}.zpl`;
    link.click();
    
    toast.success('Versandlabel generiert - bereit zum Drucken');
  };

  // Generate ZPL format for thermal label printers
  const generateZPLLabel = ({ from, to, carrier, trackingNumber, productTitle }) => {
    return `^XA
^FO50,50^A0N,40,40^FD${carrier}^FS
^FO50,100^A0N,25,25^FDVon:^FS
^FO50,130^A0N,20,20^FD${from.name}^FS
^FO50,155^A0N,20,20^FD${from.street}^FS
^FO50,180^A0N,20,20^FD${from.postal} ${from.city}^FS

^FO50,240^A0N,25,25^FDAn:^FS
^FO50,270^A0N,30,30^FD${to.name}^FS
^FO50,310^A0N,30,30^FD${to.street}^FS
^FO50,350^A0N,30,30^FD${to.postal} ${to.city}^FS
^FO50,390^A0N,30,30^FD${to.country}^FS

${trackingNumber ? `^FO50,460^A0N,25,25^FDTracking:^FS
^FO50,490^BY3^BCN,100,Y,N,N^FD${trackingNumber}^FS` : ''}

^FO50,620^A0N,20,20^FDArtikel: ${productTitle.substring(0, 40)}^FS
^XZ`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const provider = shippingProviders[shippingData.shipping_method];
      const trackingUrl = provider.trackingUrl && shippingData.tracking_number
        ? provider.trackingUrl + shippingData.tracking_number
        : shippingData.tracking_url;

      await base44.entities.Transaction.update(transaction.id, {
        ...shippingData,
        tracking_url: trackingUrl,
        status: 'shipped',
        shipped_at: new Date().toISOString()
      });

      // Send shipping notification to buyer
      try {
        await base44.integrations.Core.SendEmail({
          to: transaction.buyer_email,
          subject: `Deine Bestellung wurde versendet - ${transaction.product_title}`,
          body: `Hallo,\n\ndeine Bestellung wurde versendet!\n\nArtikel: ${transaction.product_title}\nVersandart: ${provider?.name || 'Standard'}\n${shippingData.tracking_number ? `Sendungsnummer: ${shippingData.tracking_number}` : ''}\n${trackingUrl ? `Tracking: ${trackingUrl}` : ''}\n\nViele Grüße\nDein Tivario Team`
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }

      toast.success('Versanddetails gespeichert');
      setEditing(false);
      onUpdate?.();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  const handleMarkDelivered = async () => {
    try {
      // Set dispute deadline (2 days from delivery)
      const disputeDeadline = new Date();
      disputeDeadline.setDate(disputeDeadline.getDate() + 2);

      await base44.entities.Transaction.update(transaction.id, {
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        dispute_deadline: disputeDeadline.toISOString()
      });

      // Move pending balance to available balance
      const seller = await base44.entities.User.filter({ email: transaction.seller_email });
      if (seller.length > 0) {
        const sellerUser = seller[0];
        const netAmount = transaction.net_amount || 0;
        await base44.entities.User.update(sellerUser.id, {
          balance: (sellerUser.balance || 0) + netAmount,
          pending_balance: Math.max(0, (sellerUser.pending_balance || 0) - netAmount)
        });
      }

      toast.success('Als zugestellt markiert - Guthaben verfügbar');
      onUpdate?.();
    } catch (err) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const currentStatus = statusLabels[transaction.status] || statusLabels.pending;
  const StatusIcon = currentStatus.icon;
  const provider = shippingProviders[transaction.shipping_method];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Versandverwaltung
          </CardTitle>
          <Badge className={currentStatus.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing && transaction.status !== 'shipped' && transaction.status !== 'delivered' ? (
          <Button onClick={() => setEditing(true)} className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]">
            <Truck className="w-4 h-4 mr-2" />
            Versand organisieren
          </Button>
        ) : editing ? (
          <div className="space-y-4">
            <div>
              <Label>Versandanbieter</Label>
              <Select
                value={shippingData.shipping_method}
                onValueChange={(val) => setShippingData(prev => ({ ...prev, shipping_method: val }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(shippingProviders).map(([key, provider]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                        {provider.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {shippingData.shipping_method !== 'abholung' && (
              <>
                <div>
                  <Label>Sendungsnummer</Label>
                  <Input
                    value={shippingData.tracking_number}
                    onChange={(e) => setShippingData(prev => ({ ...prev, tracking_number: e.target.value }))}
                    placeholder="z.B. 00340434161234567890"
                    className="mt-1.5"
                  />
                </div>

                {!shippingProviders[shippingData.shipping_method]?.trackingUrl && (
                  <div>
                    <Label>Tracking-URL (optional)</Label>
                    <Input
                      value={shippingData.tracking_url}
                      onChange={(e) => setShippingData(prev => ({ ...prev, tracking_url: e.target.value }))}
                      placeholder="https://..."
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <Label>Versandlabel</Label>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateLabel}
                      disabled={generatingLabel || !transaction.buyer_address}
                      className="flex-1"
                    >
                      {generatingLabel ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Printer className="w-4 h-4 mr-2" />
                      )}
                      {shippingData.shipping_method === 'dhl' ? 'DHL Label erstellen' : 'Label erstellen'}
                    </Button>
                    <label className="cursor-pointer flex-1">
                      <Button variant="outline" disabled={uploadingLabel} asChild className="w-full">
                        <span>
                          {uploadingLabel ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Hochladen
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleLabelUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-[#6B8CA8] mt-2">
                    Label direkt für Thermodrucker erstellen oder eigenes Label hochladen
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#A8D5F2] hover:bg-[#7AB8E8]">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Versand bestätigen
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${provider?.color}`} />
              <span className="font-medium text-[#2A4D66]">{provider?.name}</span>
            </div>

            {transaction.tracking_number && (
              <div>
                <Label className="text-xs text-[#6B8CA8]">Sendungsnummer</Label>
                <p className="font-mono text-sm text-[#2A4D66]">{transaction.tracking_number}</p>
              </div>
            )}

            {transaction.tracking_url && (
              <a
                href={transaction.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#7AB8E8] hover:text-[#6BB5E8] text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Sendung verfolgen
              </a>
            )}

            {transaction.shipping_label_url && (
              <a
                href={transaction.shipping_label_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#7AB8E8] hover:text-[#6BB5E8] text-sm"
              >
                <Package className="w-4 h-4" />
                Versandlabel öffnen
              </a>
            )}

            {transaction.shipped_at && (
              <div>
                <Label className="text-xs text-[#6B8CA8]">Versendet am</Label>
                <p className="text-sm text-[#2A4D66]">
                  {new Date(transaction.shipped_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            )}

            {transaction.status === 'shipped' && (
              <Button 
                onClick={handleMarkDelivered}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 mt-3"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Als zugestellt markieren
              </Button>
            )}
          </div>
        )}

        {/* Buyer Address */}
        {transaction.buyer_address && (
          <div className="pt-4 border-t border-[#E0EEF8]">
            <Label className="text-xs text-[#6B8CA8] mb-2 block">Lieferadresse</Label>
            <div className="text-sm text-[#2A4D66] space-y-1">
              <p>{transaction.buyer_address.name}</p>
              <p>{transaction.buyer_address.street}</p>
              <p>
                {transaction.buyer_address.postal} {transaction.buyer_address.city}
              </p>
              <p>{transaction.buyer_address.country}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}