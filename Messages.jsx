import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, ArrowRightLeft, Package, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('alle');

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

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-last_message_date');
      return all.filter(c => c.seller_email === user.email || c.buyer_email === user.email);
    },
    enabled: !!user,
  });

  const filteredConversations = conversations?.filter(c => {
    if (filter === 'alle') return true;
    if (filter === 'verkauf') {
      return c.seller_email === user.email;
    }
    if (filter === 'kauf') {
      return c.buyer_email === user.email;
    }
    if (filter === 'tausch') {
      return c.type === 'tausch';
    }
    return true;
  });

  const getUnreadCount = (conv) => {
    if (!user) return 0;
    return conv.seller_email === user.email ? conv.unread_seller : conv.unread_buyer;
  };

  const getOtherPartyLabel = (conv) => {
    if (!user) return '';
    if (conv.seller_email === user.email) {
      return 'Käufer';
    }
    return 'Verkäufer';
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl">
              <div className="w-16 h-16 bg-[#EBF5FF] rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#EBF5FF] rounded w-3/4" />
                <div className="h-3 bg-[#EBF5FF] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#2A4D66] mb-2">
          Nachrichten
        </h1>
        <p className="text-[#6B8CA8]">Deine Konversationen mit anderen Nutzern</p>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-[#EBF5FF] p-1 rounded-xl">
          <TabsTrigger value="alle" className="rounded-lg data-[state=active]:bg-white">Alle</TabsTrigger>
          <TabsTrigger value="kauf" className="rounded-lg data-[state=active]:bg-white">Kaufanfragen</TabsTrigger>
          <TabsTrigger value="verkauf" className="rounded-lg data-[state=active]:bg-white">Verkäufe</TabsTrigger>
          <TabsTrigger value="tausch" className="rounded-lg data-[state=active]:bg-white">Tausch</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Conversations List */}
      {!filteredConversations || filteredConversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#EBF5FF] flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-[#6B8CA8]" />
          </div>
          <h3 className="text-lg font-medium text-[#2A4D66] mb-2">Keine Nachrichten</h3>
          <p className="text-[#6B8CA8]">Starte eine Konversation bei einem Artikel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv, idx) => {
            const unread = getUnreadCount(conv);
            const isTrade = conv.type === 'tausch';
            
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={createPageUrl(`Chat?id=${conv.id}`)}>
                  <div className={`flex gap-4 p-4 bg-white rounded-2xl border border-[#E0EEF8] hover:border-[#A8D5F2] hover:shadow-lg transition-all ${
                    unread > 0 ? 'ring-2 ring-[#A8D5F2]/20' : ''
                  }`}>
                    {/* Product Image */}
                    <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[#EBF5FF]">
                      {conv.product_image && (
                        <img src={conv.product_image} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6B8CA8]">{getOtherPartyLabel(conv)}</span>
                          {isTrade && (
                            <Badge variant="secondary" className="bg-[#2A4D66] text-white text-xs gap-1 px-1.5">
                              <ArrowRightLeft className="w-3 h-3" />
                              Tausch
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-[#6B8CA8] shrink-0">
                          {conv.last_message_date && formatDistanceToNow(new Date(conv.last_message_date), {
                            addSuffix: true,
                            locale: de
                          })}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-[#2A4D66] truncate mb-1">
                        {conv.product_title}
                      </h3>
                      
                      <p className="text-sm text-[#6B8CA8] truncate">
                        {conv.last_message || 'Neue Konversation'}
                      </p>
                    </div>

                    {/* Unread Badge & Arrow */}
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <Badge className="bg-[#A8D5F2] text-white min-w-6 h-6 flex items-center justify-center">
                          {unread}
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-[#6B8CA8]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}