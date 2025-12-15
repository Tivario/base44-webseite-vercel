import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, Warehouse, ArrowRightLeft, CheckCircle, 
  AlertCircle, TrendingUp, Clock, Shield, Zap 
} from 'lucide-react';
import { calculateTrustScore, recommendShippingVariant } from './TrustScoreCalculator';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TradeVariantSelector({ 
  conversation, 
  product1, 
  product2, 
  user1Email, 
  user2Email,
  onVariantSelected 
}) {
  const [loading, setLoading] = useState(true);
  const [user1Score, setUser1Score] = useState(null);
  const [user2Score, setUser2Score] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Trust-Scores berechnen
    const score1 = await calculateTrustScore(user1Email);
    const score2 = await calculateTrustScore(user2Email);
    
    setUser1Score(score1);
    setUser2Score(score2);

    // Empfehlung generieren
    const rec = recommendShippingVariant({
      user1TrustScore: score1.score,
      user2TrustScore: score2.score,
      product1Value: product1.price || 0,
      product2Value: product2.price || 0,
      user1Transactions: score1.factors.totalTransactions || 0,
      user2Transactions: score2.factors.totalTransactions || 0
    });

    setRecommendation(rec);
    setSelectedVariant(rec.recommended);
    setLoading(false);
  };

  const handleConfirm = async () => {
    try {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 48);

      const tradeShipment = await base44.entities.TradeShipment.create({
        conversation_id: conversation.id,
        variant: selectedVariant,
        ai_recommended_variant: recommendation.recommended,
        ai_confidence_score: recommendation.confidence,
        decision_factors: recommendation.factors,
        user1_email: user1Email,
        user2_email: user2Email,
        user1_trust_score: user1Score.score,
        user2_trust_score: user2Score.score,
        product1_id: product1.id,
        product2_id: product2.id,
        product1_value: product1.price || 0,
        product2_value: product2.price || 0,
        tracking_deadline: selectedVariant === 'direct_tracking' ? deadline.toISOString() : null,
        status: selectedVariant === 'direct_tracking' 
          ? 'waiting_for_tracking' 
          : 'waiting_for_warehouse',
        fulfillment_fee: selectedVariant === 'fulfillment' ? 9.90 : 0,
        warehouse_address: selectedVariant === 'fulfillment' ? {
          name: 'Tivario Fulfillment Center',
          street: 'Logistikstraße 42',
          postal: '10115',
          city: 'Berlin',
          country: 'Deutschland'
        } : null
      });

      toast.success('Versandvariante ausgewählt');
      onVariantSelected?.(tradeShipment);
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#A8D5F2] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#6B8CA8]">Analysiere Tauschbedingungen...</p>
        </CardContent>
      </Card>
    );
  }

  const variants = [
    {
      id: 'direct_tracking',
      icon: Package,
      title: 'Direktversand mit Tracking',
      description: 'Beide Partner versenden direkt zueinander',
      features: [
        'Tracking-Nummer Pflicht',
        '48h Countdown für Eingabe',
        'Schneller Tausch',
        'Keine zusätzlichen Gebühren'
      ],
      recommended: recommendation.recommended === 'direct_tracking',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'fulfillment',
      icon: Warehouse,
      title: 'Zwischenlager / Fulfillment',
      description: 'Versand über sicheres Zwischenlager',
      features: [
        'Maximale Sicherheit',
        'Prüfung im Lager',
        'Versicherter Weitertransport',
        `${(9.90).toFixed(2)} € Gebühr`
      ],
      recommended: recommendation.recommended === 'fulfillment',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* AI Recommendation Banner */}
      <Alert className="bg-gradient-to-r from-[#A8D5F2]/10 to-[#7AB8E8]/10 border-[#A8D5F2]">
        <Zap className="w-5 h-5 text-[#7AB8E8]" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#2A4D66] mb-1">
                KI-Empfehlung: {variants.find(v => v.id === recommendation.recommended)?.title}
              </p>
              <p className="text-sm text-[#6B8CA8]">
                Konfidenz: {(recommendation.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <Badge className="bg-[#A8D5F2] text-white">
              {recommendation.reasoning[0]}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Trust Scores */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border-[#E0EEF8]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[#A8D5F2]" />
              <span className="text-sm font-medium text-[#2A4D66]">Nutzer 1</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#7AB8E8]">{user1Score.score}</span>
              <span className="text-sm text-[#6B8CA8]">/ 100</span>
            </div>
            <p className="text-xs text-[#6B8CA8] mt-1">
              {user1Score.factors.totalTransactions} Transaktionen
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E0EEF8]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[#A8D5F2]" />
              <span className="text-sm font-medium text-[#2A4D66]">Nutzer 2</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#7AB8E8]">{user2Score.score}</span>
              <span className="text-sm text-[#6B8CA8]">/ 100</span>
            </div>
            <p className="text-xs text-[#6B8CA8] mt-1">
              {user2Score.factors.totalTransactions} Transaktionen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variant Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-[#2A4D66]">Wähle die Versandvariante:</h3>
        
        {variants.map((variant, idx) => (
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${
                selectedVariant === variant.id
                  ? 'ring-2 ring-[#A8D5F2] shadow-lg'
                  : 'hover:border-[#A8D5F2]'
              } ${variant.recommended ? 'bg-gradient-to-br from-[#F8FBFF] to-white' : ''}`}
              onClick={() => setSelectedVariant(variant.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${variant.color} flex items-center justify-center`}>
                      <variant.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{variant.title}</CardTitle>
                      <p className="text-sm text-[#6B8CA8] mt-1">{variant.description}</p>
                    </div>
                  </div>
                  {variant.recommended && (
                    <Badge className="bg-gradient-to-r from-[#A8D5F2] to-[#7AB8E8] text-white">
                      Empfohlen
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {variant.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#2A4D66]">
                      <CheckCircle className="w-4 h-4 text-[#A8D5F2]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reasoning */}
      <Card className="bg-[#EBF5FF] border-[#A8D5F2]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#7AB8E8] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#2A4D66] mb-2">Entscheidungsfaktoren:</p>
              <ul className="space-y-1 text-sm text-[#2A4D66]">
                {recommendation.reasoning.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <Button 
        onClick={handleConfirm}
        className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white h-12"
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        {selectedVariant === 'direct_tracking' ? 'Direktversand starten' : 'Fulfillment starten'}
      </Button>
    </div>
  );
}