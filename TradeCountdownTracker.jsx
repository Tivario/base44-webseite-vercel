import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Package, CheckCircle, AlertTriangle, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function TradeCountdownTracker({ tradeShipment, currentUserEmail, onUpdate }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const isUser1 = currentUserEmail === tradeShipment.user1_email;
  const hasSubmitted = isUser1 
    ? !!tradeShipment.user1_tracking_number 
    : !!tradeShipment.user2_tracking_number;

  const otherUserSubmitted = isUser1
    ? !!tradeShipment.user2_tracking_number
    : !!tradeShipment.user1_tracking_number;

  useEffect(() => {
    if (!tradeShipment.tracking_deadline) return;

    const interval = setInterval(() => {
      const deadline = new Date(tradeShipment.tracking_deadline);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft({ expired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ hours, minutes, expired: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tradeShipment.tracking_deadline]);

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Bitte Tracking-Nummer eingeben');
      return;
    }

    setSubmitting(true);
    try {
      const updateData = isUser1 
        ? {
            user1_tracking_number: trackingNumber,
            user1_tracking_submitted_at: new Date().toISOString()
          }
        : {
            user2_tracking_number: trackingNumber,
            user2_tracking_submitted_at: new Date().toISOString()
          };

      // Prüfen ob beide Tracking-Nummern vorhanden
      const bothSubmitted = isUser1
        ? !!tradeShipment.user2_tracking_number
        : !!tradeShipment.user1_tracking_number;

      if (bothSubmitted) {
        updateData.status = 'both_tracking_submitted';
      }

      await base44.entities.TradeShipment.update(tradeShipment.id, updateData);

      // Email-Benachrichtigung
      const otherUserEmail = isUser1 ? tradeShipment.user2_email : tradeShipment.user1_email;
      await base44.integrations.Core.SendEmail({
        to: otherUserEmail,
        subject: '📦 Tauschpartner hat Tracking-Nummer eingegeben',
        body: `Gute Neuigkeiten! Dein Tauschpartner hat die Tracking-Nummer eingegeben.\n\nTracking: ${trackingNumber}\n\nDu kannst jetzt deine Sendung verfolgen.`
      });

      toast.success('Tracking-Nummer gespeichert');
      onUpdate?.();
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
    setSubmitting(false);
  };

  const getStatusColor = () => {
    if (hasSubmitted && otherUserSubmitted) return 'bg-green-500';
    if (hasSubmitted) return 'bg-blue-500';
    if (timeLeft?.expired) return 'bg-red-500';
    if (timeLeft && timeLeft.hours < 12) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <Card className="bg-white border-[#E0EEF8]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Tracking & Countdown
          </CardTitle>
          <Badge className={`${getStatusColor()} text-white`}>
            {tradeShipment.status === 'both_tracking_submitted' 
              ? 'Beide versendet'
              : hasSubmitted 
                ? 'Gesendet'
                : 'Ausstehend'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown */}
        {timeLeft && !timeLeft.expired && !hasSubmitted && (
          <Alert className={`${timeLeft.hours < 12 ? 'bg-orange-50 border-orange-300' : 'bg-blue-50 border-blue-300'}`}>
            <Timer className={`w-5 h-5 ${timeLeft.hours < 12 ? 'text-orange-600' : 'text-blue-600'}`} />
            <AlertDescription>
              <div className="font-semibold text-[#2A4D66] mb-1">
                ⏰ Noch {timeLeft.hours}h {timeLeft.minutes}m Zeit
              </div>
              <p className="text-sm text-[#6B8CA8]">
                Bitte gib deine Tracking-Nummer innerhalb von 48h ein
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Expired Warning */}
        {timeLeft?.expired && !hasSubmitted && (
          <Alert className="bg-red-50 border-red-300">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription>
              <div className="font-semibold text-red-900 mb-1">
                ⚠️ Deadline überschritten
              </div>
              <p className="text-sm text-red-700">
                Die 48h-Frist ist abgelaufen. Bitte kontaktiere den Support.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Input Form */}
        {!hasSubmitted && (
          <div className="space-y-3">
            <Label>Deine Tracking-Nummer</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="z.B. DHL1234567890"
              className="border-[#E0EEF8]"
            />
            <Button 
              onClick={handleSubmit}
              disabled={submitting || !trackingNumber.trim()}
              className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]"
            >
              {submitting ? 'Speichert...' : 'Tracking-Nummer eingeben'}
            </Button>
          </div>
        )}

        {/* Submitted Info */}
        {hasSubmitted && (
          <div className="p-4 bg-[#EBF5FF] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-[#2A4D66]">Deine Sendung</span>
            </div>
            <p className="text-sm text-[#6B8CA8] mb-1">
              Tracking: <span className="font-mono text-[#2A4D66]">
                {isUser1 ? tradeShipment.user1_tracking_number : tradeShipment.user2_tracking_number}
              </span>
            </p>
            <p className="text-xs text-[#6B8CA8]">
              Eingegeben {formatDistanceToNow(
                new Date(isUser1 
                  ? tradeShipment.user1_tracking_submitted_at 
                  : tradeShipment.user2_tracking_submitted_at
                ), 
                { addSuffix: true, locale: de }
              )}
            </p>
          </div>
        )}

        {/* Other User Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#6B8CA8]" />
            <span className="font-semibold text-[#2A4D66]">Tauschpartner</span>
          </div>
          {otherUserSubmitted ? (
            <>
              <p className="text-sm text-[#6B8CA8] mb-1">
                Tracking: <span className="font-mono text-[#2A4D66]">
                  {isUser1 ? tradeShipment.user2_tracking_number : tradeShipment.user1_tracking_number}
                </span>
              </p>
              <Badge className="bg-green-500 text-white text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Versendet
              </Badge>
            </>
          ) : (
            <p className="text-sm text-[#6B8CA8]">
              Wartet noch auf Tracking-Eingabe...
            </p>
          )}
        </div>

        {/* Both Submitted */}
        {hasSubmitted && otherUserSubmitted && (
          <Alert className="bg-green-50 border-green-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-900">
                🎉 Beide Pakete sind unterwegs!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Ihr könnt eure Sendungen jetzt verfolgen und nach Erhalt bewerten.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}