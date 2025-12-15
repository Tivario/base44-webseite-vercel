import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Eye, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const statusColors = {
  offen: 'bg-yellow-100 text-yellow-800',
  in_pruefung: 'bg-blue-100 text-blue-800',
  kaeufer_gewinnt: 'bg-green-100 text-green-800',
  verkaeufer_gewinnt: 'bg-purple-100 text-purple-800',
  abgelehnt: 'bg-red-100 text-red-800',
  geloest: 'bg-gray-100 text-gray-800'
};

export default function AdminDisputes() {
  const [user, setUser] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['all-disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date'),
    enabled: !!user,
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, status, refundAmount, keepProduct }) => {
      await base44.entities.Dispute.update(disputeId, {
        status,
        resolution,
        admin_notes: adminNotes,
        refund_amount: refundAmount,
        keep_product: keepProduct,
        resolved_at: new Date().toISOString(),
        resolved_by: user.email
      });

      const dispute = disputes.find(d => d.id === disputeId);
      
      // Email an Käufer
      await base44.integrations.Core.SendEmail({
        to: dispute.buyer_email,
        subject: `Entscheidung zu deiner Reklamation - ${dispute.product_title}`,
        body: `Hallo,\n\nwir haben deine Reklamation geprüft.\n\nEntscheidung: ${status}\n${resolution}\n\n${keepProduct ? '✅ Du darfst das Produkt behalten.\n' : ''}${refundAmount > 0 ? `💰 Erstattung: ${refundAmount.toFixed(2)} €\n` : ''}\n\nViele Grüße\nDein Tivario Team`
      });

      // Email an Verkäufer
      await base44.integrations.Core.SendEmail({
        to: dispute.seller_email,
        subject: `Entscheidung zur Reklamation - ${dispute.product_title}`,
        body: `Hallo,\n\ndie Reklamation zu deinem Artikel wurde bearbeitet.\n\nEntscheidung: ${status}\n${resolution}\n\nViele Grüße\nDein Tivario Team`
      });

      if (refundAmount > 0 && keepProduct) {
        // Update buyer balance
        const buyers = await base44.entities.User.filter({ email: dispute.buyer_email });
        if (buyers.length > 0) {
          const buyer = buyers[0];
          await base44.entities.User.update(buyer.id, {
            balance: (buyer.balance || 0) + refundAmount
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-disputes']);
      toast.success('Dispute gelöst');
      setSelectedDispute(null);
      setResolution('');
      setAdminNotes('');
    },
  });

  if (!user || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white border rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const openDisputes = disputes?.filter(d => d.status === 'offen' || d.status === 'in_pruefung') || [];
  const resolvedDisputes = disputes?.filter(d => d.status !== 'offen' && d.status !== 'in_pruefung') || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Reklamationen & Käuferschutz
        </h1>
        <p className="text-[#6B8CA8]">Verwalte Reklamationen und Käuferschutz-Fälle</p>
      </div>

      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="bg-[#EBF5FF]">
          <TabsTrigger value="open">
            Offen ({openDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Gelöst ({resolvedDisputes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          {openDisputes.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-[#6B8CA8]">Keine offenen Reklamationen</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {openDisputes.map((dispute) => (
                <Card key={dispute.id} className="bg-white border-[#E0EEF8]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{dispute.product_title}</CardTitle>
                        <p className="text-sm text-[#6B8CA8] mt-1">
                          Eingereicht am {format(new Date(dispute.created_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                      <Badge className={statusColors[dispute.status]}>
                        {dispute.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#6B8CA8]">Käufer</p>
                        <p className="text-sm font-medium text-[#2A4D66]">{dispute.buyer_email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B8CA8]">Verkäufer</p>
                        <p className="text-sm font-medium text-[#2A4D66]">{dispute.seller_email}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-[#6B8CA8] mb-1">Grund</p>
                      <Badge variant="outline">{dispute.reason}</Badge>
                    </div>

                    <div>
                      <p className="text-xs text-[#6B8CA8] mb-1">Beschreibung</p>
                      <p className="text-sm text-[#2A4D66] bg-gray-50 p-3 rounded-lg">
                        {dispute.description}
                      </p>
                    </div>

                    {dispute.evidence_images?.length > 0 && (
                      <div>
                        <p className="text-xs text-[#6B8CA8] mb-2">Beweisfotos</p>
                        <div className="grid grid-cols-3 gap-2">
                          {dispute.evidence_images.map((img, idx) => (
                            <Dialog key={idx}>
                              <DialogTrigger asChild>
                                <div className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <img src={img} alt="" className="w-full" />
                              </DialogContent>
                            </Dialog>
                          ))}
                        </div>
                      </div>
                    )}

                    <Dialog open={selectedDispute?.id === dispute.id} onOpenChange={() => setSelectedDispute(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedDispute(dispute)}
                          className="w-full bg-[#A8D5F2] hover:bg-[#7AB8E8]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Fall bearbeiten
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Dispute bearbeiten</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Entscheidung</label>
                            <Textarea
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              placeholder="Begründung der Entscheidung..."
                              rows={4}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Admin-Notizen (intern)</label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Interne Notizen..."
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button
                              onClick={() => resolveDisputeMutation.mutate({
                                disputeId: dispute.id,
                                status: 'kaeufer_gewinnt',
                                refundAmount: dispute.transaction_id ? 0 : 0,
                                keepProduct: true
                              })}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Käufer gewinnt
                            </Button>
                            <Button
                              onClick={() => resolveDisputeMutation.mutate({
                                disputeId: dispute.id,
                                status: 'verkaeufer_gewinnt',
                                refundAmount: 0,
                                keepProduct: false
                              })}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verkäufer gewinnt
                            </Button>
                          </div>

                          <Button
                            onClick={() => resolveDisputeMutation.mutate({
                              disputeId: dispute.id,
                              status: 'abgelehnt',
                              refundAmount: 0,
                              keepProduct: false
                            })}
                            variant="outline"
                            className="w-full border-red-300 text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Ablehnen
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          {resolvedDisputes.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <p className="text-[#6B8CA8]">Keine gelösten Fälle</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resolvedDisputes.map((dispute) => (
                <Card key={dispute.id} className="bg-white border-[#E0EEF8]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{dispute.product_title}</CardTitle>
                        <p className="text-sm text-[#6B8CA8] mt-1">
                          Gelöst am {format(new Date(dispute.resolved_at || dispute.updated_date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                      <Badge className={statusColors[dispute.status]}>
                        {dispute.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#6B8CA8]">Grund</p>
                        <p className="text-sm text-[#2A4D66]">{dispute.reason}</p>
                      </div>
                      {dispute.resolution && (
                        <div>
                          <p className="text-xs text-[#6B8CA8]">Entscheidung</p>
                          <p className="text-sm text-[#2A4D66]">{dispute.resolution}</p>
                        </div>
                      )}
                      {dispute.keep_product && (
                        <Badge className="bg-green-100 text-green-800">
                          Produkt behalten erlaubt
                        </Badge>
                      )}
                      {dispute.refund_amount > 0 && (
                        <p className="text-sm font-semibold text-green-600">
                          Erstattung: {dispute.refund_amount.toFixed(2)} €
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}