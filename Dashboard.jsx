import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Package, Euro, ArrowRightLeft, Calendar, 
  Download, ChevronDown, BarChart3, PieChart, FileText, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

const COLORS = ['#7AB8E8', '#A8D5F2', '#2A4D66', '#6B8CA8', '#4A7B99'];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

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

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['seller-products', user?.email],
    queryFn: () => base44.entities.Product.filter({ seller_email: user.email }),
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!transactions || !products) return null;

    const now = new Date();
    const days = parseInt(timeRange.replace('d', ''));
    const rangeStart = subDays(now, days);

    const filteredTransactions = transactions.filter(t => 
      t.status === 'completed' && 
      new Date(t.created_date) >= rangeStart
    );

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalFees = filteredTransactions.reduce((sum, t) => sum + (t.fee || 0), 0);
    const netRevenue = filteredTransactions.reduce((sum, t) => sum + (t.net_amount || t.amount || 0), 0);
    const totalProfit = filteredTransactions.reduce((sum, t) => {
      if (t.original_price) {
        return sum + ((t.amount || 0) - t.original_price - (t.fee || 0));
      }
      return sum;
    }, 0);

    const salesCount = filteredTransactions.filter(t => t.type === 'verkauf').length;
    const tradesCount = filteredTransactions.filter(t => t.type === 'tausch').length;

    const avgPrice = salesCount > 0 
      ? filteredTransactions.filter(t => t.type === 'verkauf').reduce((sum, t) => sum + (t.amount || 0), 0) / salesCount 
      : 0;

    // Chart data
    const chartData = [];
    const chartDays = parseInt(timeRange.replace('d', ''));
    const maxDays = chartDays > 90 ? 90 : chartDays + 1;
    for (let i = maxDays - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.created_date);
        return tDate >= dayStart && tDate <= dayEnd;
      });

      const dayRevenue = dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      chartData.push({
        date: format(dayStart, 'dd.MM', { locale: de }),
        revenue: dayRevenue,
      });
    }

    // Category breakdown
    const categoryBreakdown = {};
    filteredTransactions.forEach(t => {
      const product = products.find(p => p.id === t.product_id);
      const category = product?.category || 'sonstiges';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (t.amount || 0);
    });

    const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
      value
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    return {
      totalRevenue,
      totalFees,
      netRevenue,
      totalProfit,
      salesCount,
      tradesCount,
      avgPrice,
      chartData,
      pieData,
      transactions: filteredTransactions,
    };
  }, [transactions, products, timeRange]);

  const exportToCSV = () => {
    if (!stats?.transactions) return;

    const headers = ['Datum', 'Artikel', 'Typ', 'Betrag', 'Gebühren', 'Netto', 'Einkaufspreis', 'Gewinn'];
    const rows = stats.transactions.map(t => [
      format(new Date(t.created_date), 'dd.MM.yyyy'),
      t.product_title,
      t.type === 'verkauf' ? 'Verkauf' : 'Tausch',
      t.amount?.toFixed(2) || '0.00',
      t.fee?.toFixed(2) || '0.00',
      t.net_amount?.toFixed(2) || t.amount?.toFixed(2) || '0.00',
      t.original_price?.toFixed(2) || '',
      t.original_price ? ((t.amount || 0) - t.original_price - (t.fee || 0)).toFixed(2) : ''
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tivaro-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (!user || loadingTransactions || loadingProducts) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600">Verkaufsübersicht und Statistiken</p>
            
            {stats?.totalRevenue > 600 && (
              <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-800">
                <strong>⚠️ Gewerbeanmeldungs-Hinweis:</strong> Ab 600€ Jahresumsatz kann eine Gewerbeanmeldung erforderlich sein. Konsultiere einen Steuerberater.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 h-9 bg-white border-gray-300 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0d">Heute</SelectItem>
                <SelectItem value="1d">Gestern</SelectItem>
                <SelectItem value="7d">Vor 7 Tagen</SelectItem>
                <SelectItem value="30d">Vor 1 Monat</SelectItem>
                <SelectItem value="90d">Vor 3 Monaten</SelectItem>
                <SelectItem value="365d">1 Jahr</SelectItem>
                <SelectItem value="1095d">3 Jahre</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={exportToCSV}
              size="sm"
              className="h-9 border-gray-300 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportieren
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { 
              label: 'Gesamtumsatz', 
              value: `${stats?.totalRevenue?.toFixed(2) || '0.00'} €`, 
              icon: Euro
            },
            { 
              label: 'Netto-Umsatz', 
              value: `${stats?.netRevenue?.toFixed(2) || '0.00'} €`, 
              icon: TrendingUp
            },
            { 
              label: 'Verkäufe / Tausch', 
              value: `${stats?.salesCount || 0} / ${stats?.tradesCount || 0}`, 
              icon: Package
            },
            { 
              label: 'Durchschnittspreis', 
              value: `${stats?.avgPrice?.toFixed(2) || '0.00'} €`, 
              icon: BarChart3
            },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white border border-gray-200 shadow-sm rounded">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-[#EBF5FF]">
                    <stat.icon className="w-4 h-4 text-[#7AB8E8]" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white border border-gray-200 shadow-sm rounded">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Geschätzter Gewinn</p>
                <div className="w-8 h-8 rounded flex items-center justify-center bg-[#EBF5FF]">
                  <TrendingUp className="w-4 h-4 text-[#7AB8E8]" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalProfit !== undefined ? (
                  stats.totalProfit >= 0 ? `+${stats.totalProfit.toFixed(2)} €` : `${stats.totalProfit.toFixed(2)} €`
                ) : '0.00 €'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Basierend auf Einkaufspreisen
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm rounded">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Aktive Artikel</p>
                <div className="w-8 h-8 rounded flex items-center justify-center bg-[#EBF5FF]">
                  <Package className="w-4 h-4 text-[#7AB8E8]" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {products?.filter(p => p.status === 'aktiv').length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Revenue Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded lg:col-span-2">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Umsatzentwicklung
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats?.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7AB8E8" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#A8D5F2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}€`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value.toFixed(2)} €`, 'Umsatz']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#7AB8E8" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Top Kategorien
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats?.pieData?.length > 0 ? (
                <div className="space-y-3">
                  {stats.pieData.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{item.name}</span>
                        <span className="text-gray-900 font-semibold">{item.value.toFixed(2)} €</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-sm overflow-hidden">
                        <div 
                          className="h-full rounded-sm"
                          style={{ 
                            width: `${(item.value / stats.pieData[0].value) * 100}%`,
                            backgroundColor: COLORS[idx % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Daily Sales */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Verkäufe pro Tag
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats?.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}€`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value.toFixed(2)} €`, 'Umsatz']}
                    />
                    <Bar dataKey="revenue" fill="#7AB8E8" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profit Trend */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Gewinnentwicklung
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats?.transactions?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={stats.chartData.map(item => ({
                    ...item,
                    profit: item.revenue * 0.7
                  }))}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2A4D66" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6B8CA8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}€`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value.toFixed(2)} €`, 'Gewinn (geschätzt)']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#2A4D66" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorProfit)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded mb-6">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">
              Letzte Transaktionen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {stats?.transactions?.length > 0 ? (
                stats.transactions.slice(0, 10).map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded flex items-center justify-center ${
                        t.type === 'tausch' ? 'bg-[#EBF5FF]' : 'bg-[#EBF5FF]'
                      }`}>
                        {t.type === 'tausch' ? (
                          <ArrowRightLeft className="w-4 h-4 text-[#7AB8E8]" />
                        ) : (
                          <Euro className="w-4 h-4 text-[#7AB8E8]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.product_title}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(t.created_date), 'dd.MM.yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {t.type === 'tausch' ? 'Tausch' : `${t.amount?.toFixed(2)} €`}
                      </p>
                      {t.fee > 0 && t.type !== 'tausch' && (
                        <p className="text-xs text-gray-500">
                          Gebühr: {t.fee.toFixed(2)} €
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-12 text-sm">Noch keine Transaktionen</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax Notice */}
        <Card className="bg-[#EBF5FF] border border-[#A8D5F2] shadow-sm rounded">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#7AB8E8] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Steuerhinweis</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Als Verkäufer bist du für die korrekte Versteuerung deiner Einnahmen verantwortlich. 
                  Bitte konsultiere einen Steuerberater für genaue Informationen zu deinen Steuerpflichten.
                  Die hier angezeigte Gewinnschätzung dient nur als Orientierung.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}