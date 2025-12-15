import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Warehouse, Package, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function FulfillmentTracker({ tradeShipment }) {
  const user1Received = !!tradeShipment.user1_received_at_warehouse;
  const user2Received = !!tradeShipment.user2_received_at_warehouse;
  const bothReceived = user1Received && user2Received;

  const getStatusStep = () => {
    if (bothReceived) return 3;
    if (user1Received || user2Received) return 2;
    return 1;
  };

  const steps = [
    {
      title: 'Versand zum Lager',
      description: 'Beide Nutzer versenden zum Zwischenlager',
      completed: user1Received && user2Received,
      active: !user1Received || !user2Received
    },
    {
      title: 'Im Lager angekommen',
      description: 'Artikel werden geprüft',
      completed: bothReceived,
      active: (user1Received || user2Received) && !bothReceived
    },
    {
      title: 'Weitertransport',
      description: 'Versand zu den Tauschpartnern',
      completed: tradeShipment.status === 'completed',
      active: bothReceived && tradeShipment.status !== 'completed'
    }
  ];

  return (
    <Card className="bg-white border-[#E0EEF8]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="w-5 h-5" />
            Fulfillment-Status
          </CardTitle>
          <Badge className="bg-[#7AB8E8] text-white">
            Schritt {getStatusStep()} / 3
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warehouse Address */}
        <Alert className="bg-[#EBF5FF] border-[#A8D5F2]">
          <MapPin className="w-5 h-5 text-[#7AB8E8]" />
          <AlertDescription>
            <p className="font-semibold text-[#2A4D66] mb-2">Versandadresse (Zwischenlager):</p>
            <div className="text-sm text-[#2A4D66] space-y-0.5">
              <p>{tradeShipment.warehouse_address?.name}</p>
              <p>{tradeShipment.warehouse_address?.street}</p>
              <p>{tradeShipment.warehouse_address?.postal} {tradeShipment.warehouse_address?.city}</p>
              <p>{tradeShipment.warehouse_address?.country}</p>
            </div>
            <p className="text-xs text-[#6B8CA8] mt-2">
              💰 Fulfillment-Gebühr: {tradeShipment.fulfillment_fee?.toFixed(2)} €
            </p>
          </AlertDescription>
        </Alert>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.active 
                      ? 'bg-[#A8D5F2] text-white' 
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : step.active ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <span className="text-sm font-bold">{idx + 1}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <h4 className="font-semibold text-[#2A4D66] mb-1">{step.title}</h4>
                <p className="text-sm text-[#6B8CA8]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Package Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${user1Received ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${user1Received ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-[#2A4D66]">Paket 1</span>
            </div>
            <Badge className={user1Received ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}>
              {user1Received ? 'Im Lager' : 'Unterwegs'}
            </Badge>
          </div>

          <div className={`p-4 rounded-lg ${user2Received ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${user2Received ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-[#2A4D66]">Paket 2</span>
            </div>
            <Badge className={user2Received ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}>
              {user2Received ? 'Im Lager' : 'Unterwegs'}
            </Badge>
          </div>
        </div>

        {/* All Received */}
        {bothReceived && (
          <Alert className="bg-green-50 border-green-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-900">
                ✅ Beide Artikel im Lager angekommen
              </p>
              <p className="text-sm text-green-700 mt-1">
                Die Artikel werden geprüft und in Kürze zu euch versendet.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}