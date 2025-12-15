import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, User, Package, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

const reasonLabels = {
  betrug: 'Betrug / Täuschung',
  spam: 'Spam',
  unangemessener_inhalt: 'Unangemessener Inhalt',
  copyright: 'Urheberrechtsverletzung',
  gefaelschte_artikel: 'Gefälschte Artikel',
  beleidigung: 'Beleidigung / Hassrede',
  sonstiges: 'Sonstiges',
};

const statusColors = {
  offen: 'bg-yellow-100 text-yellow-800',
  in_pruefung: 'bg-blue-100 text-blue-800',
  erledigt: 'bg-green-100 text-green-800',
  abgelehnt: 'bg-red-100 text-red-800',
};

export default function AdminReports() {
  const [filter, setFilter] = useState('offen');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', filter],
    queryFn: async () => {
      if (filter === 'alle') {
        return base44.entities.Report.list('-created_date');
      }
      return base44.entities.Report.filter({ status: filter }, '-created_date');
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Status aktualisiert');
      setSelectedReport(null);
    },
  });

  const handleStatusUpdate = (reportId, newStatus) => {
    updateReportMutation.mutate({
      id: reportId,
      data: {
        status: newStatus,
        admin_notes: adminNotes || undefined,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Meldungen verwalten
        </h1>
        <p className="text-[#6B8CA8]">Übersicht aller Nutzer- und Artikelmeldungen</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-[#EBF5FF] p-1 rounded-xl mb-6">
          <TabsTrigger value="offen">Offen</TabsTrigger>
          <TabsTrigger value="in_pruefung">In Prüfung</TabsTrigger>
          <TabsTrigger value="erledigt">Erledigt</TabsTrigger>
          <TabsTrigger value="alle">Alle</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-[#6B8CA8]">Lade Meldungen...</p>
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <Flag className="w-12 h-12 mx-auto mb-4 text-[#6B8CA8]" />
              <p className="text-[#6B8CA8]">Keine Meldungen gefunden</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Flag className="w-5 h-5 text-red-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={statusColors[report.status]}>
                                {report.status === 'offen' ? 'Offen' : 
                                 report.status === 'in_pruefung' ? 'In Prüfung' :
                                 report.status === 'erledigt' ? 'Erledigt' : 'Abgelehnt'}
                              </Badge>
                              <Badge variant="secondary" className="bg-[#EBF5FF] text-[#6B8CA8]">
                                {reasonLabels[report.reason]}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#6B8CA8]">
                              Gemeldet {formatDistanceToNow(new Date(report.created_date), {
                                addSuffix: true,
                                locale: de,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-[#6B8CA8]" />
                            <span className="text-[#2A4D66]">
                              Von: {report.reporter_email}
                            </span>
                          </div>
                          
                          {report.target_user_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-[#6B8CA8]" />
                              <span className="text-[#2A4D66]">
                                Gemeldeter Nutzer: {report.target_user_email}
                              </span>
                            </div>
                          )}
                          
                          {report.target_product_id && (
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="w-4 h-4 text-[#6B8CA8]" />
                              <span className="text-[#2A4D66]">
                                Gemeldeter Artikel: {report.target_product_title}
                              </span>
                            </div>
                          )}
                        </div>

                        {report.description && (
                          <div className="bg-[#F8FBFF] rounded-lg p-3 mb-4">
                            <p className="text-sm text-[#2A4D66]">{report.description}</p>
                          </div>
                        )}

                        {report.admin_notes && (
                          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                            <p className="text-xs font-medium text-yellow-800 mb-1">Admin Notizen:</p>
                            <p className="text-sm text-yellow-900">{report.admin_notes}</p>
                          </div>
                        )}

                        {selectedReport?.id === report.id && (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Admin Notizen hinzufügen..."
                              rows={2}
                              className="border-[#E0EEF8]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(report.id, 'in_pruefung')}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                In Prüfung
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(report.id, 'erledigt')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Erledigt
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(report.id, 'abgelehnt')}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Ablehnen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedReport(null);
                                  setAdminNotes('');
                                }}
                              >
                                Abbrechen
                              </Button>
                            </div>
                          </div>
                        )}

                        {report.status === 'offen' && selectedReport?.id !== report.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(report);
                              setAdminNotes(report.admin_notes || '');
                            }}
                            className="mt-3"
                          >
                            Bearbeiten
                          </Button>
                        )}
                      </div>
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