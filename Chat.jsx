import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Send, ArrowRightLeft, Package, Check, 
  CheckCheck, ExternalLink, MoreVertical, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TradeVariantSelector from '../components/trade/TradeVariantSelector';
import TradeCountdownTracker from '../components/trade/TradeCountdownTracker';
import FulfillmentTracker from '../components/trade/FulfillmentTracker';

export default function Chat() {
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

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

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const convs = await base44.entities.Conversation.filter({ id: conversationId });
      return convs[0];
    },
    enabled: !!conversationId,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }, 'created_date'),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });

  const { data: tradeShipment, refetch: refetchTradeShipment } = useQuery({
    queryKey: ['trade-shipment', conversationId],
    queryFn: async () => {
      const shipments = await base44.entities.TradeShipment.filter({ conversation_id: conversationId });
      return shipments.length > 0 ? shipments[0] : null;
    },
    enabled: !!conversationId && conversation?.type === 'tausch',
    refetchInterval: 10000,
  });

  const { data: products } = useQuery({
    queryKey: ['trade-products', conversation?.product_id, conversation?.trade_offer_product_id],
    queryFn: async () => {
      const [product1, product2] = await Promise.all([
        base44.entities.Product.filter({ id: conversation.product_id }),
        base44.entities.Product.filter({ id: conversation.trade_offer_product_id })
      ]);
      return { product1: product1[0], product2: product2[0] };
    },
    enabled: !!conversation?.product_id && !!conversation?.trade_offer_product_id,
  });

  useEffect(() => {
    if (messages && user && conversation) {
      markAsRead();
    }
    scrollToBottom();
  }, [messages]);

  const markAsRead = async () => {
    if (!conversation || !user) return;
    
    const updateField = conversation.seller_email === user.email 
      ? { unread_seller: 0 }
      : { unread_buyer: 0 };
    
    await base44.entities.Conversation.update(conversationId, updateField);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        content,
        type: 'text',
        read: false,
      });

      // Update conversation
      const unreadField = conversation.seller_email === user.email 
        ? { unread_buyer: (conversation.unread_buyer || 0) + 1 }
        : { unread_seller: (conversation.unread_seller || 0) + 1 };

      await base44.entities.Conversation.update(conversationId, {
        last_message: content,
        last_message_date: new Date().toISOString(),
        ...unreadField
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', conversationId]);
      setNewMessage('');
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const isMyMessage = (msg) => msg.sender_email === user?.email;
  const isSeller = conversation?.seller_email === user?.email;
  const otherParty = isSeller ? 'Käufer' : 'Verkäufer';

  if (!conversation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-[#6B8CA8]">Konversation wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0EEF8] p-4 flex items-center gap-4">
        <Link to={createPageUrl('Messages')}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        <Link to={createPageUrl(`ProductDetail?id=${conversation.product_id}`)} className="flex-1 flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-[#EBF5FF]">
            {conversation.product_image && (
              <img src={conversation.product_image} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#2A4D66] truncate">{conversation.product_title}</p>
            <p className="text-sm text-[#6B8CA8]">Chat mit {otherParty}</p>
          </div>
        </Link>

        {conversation.type === 'tausch' && (
          <Badge className="bg-[#2A4D66] text-white shrink-0 gap-1">
            <ArrowRightLeft className="w-3 h-3" />
            Tausch
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={createPageUrl(`ProductDetail?id=${conversation.product_id}`)} className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Artikel anzeigen
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Trade Info Banner */}
      {conversation.type === 'tausch' && conversation.trade_offer_product_title && (
        <div className="bg-[#EBF5FF] px-4 py-3 flex items-center gap-3 border-b border-[#E0EEF8]">
          <ArrowRightLeft className="w-5 h-5 text-[#A8D5F2]" />
          <div className="flex-1">
            <p className="text-sm text-[#2A4D66]">
              <span className="font-medium">Tauschanfrage:</span> {conversation.trade_offer_product_title}
            </p>
          </div>
          {conversation.trade_offer_product_id && (
            <Link to={createPageUrl(`ProductDetail?id=${conversation.trade_offer_product_id}`)}>
              <Button variant="outline" size="sm">Ansehen</Button>
            </Link>
          )}
        </div>
      )}

      {/* Trade Management */}
      {conversation.type === 'tausch' && conversation.status === 'deal_abgeschlossen' && products && (
        <div className="p-4 bg-white border-b border-[#E0EEF8]">
          {!tradeShipment && (
            <TradeVariantSelector
              conversation={conversation}
              product1={products.product1}
              product2={products.product2}
              user1Email={conversation.seller_email}
              user2Email={conversation.buyer_email}
              onVariantSelected={refetchTradeShipment}
            />
          )}

          {tradeShipment && tradeShipment.variant === 'direct_tracking' && 
           (tradeShipment.status === 'waiting_for_tracking' || tradeShipment.status === 'both_tracking_submitted') && (
            <TradeCountdownTracker
              tradeShipment={tradeShipment}
              currentUserEmail={user?.email}
              onUpdate={refetchTradeShipment}
            />
          )}

          {tradeShipment && tradeShipment.variant === 'fulfillment' && (
            <FulfillmentTracker
              tradeShipment={tradeShipment}
              onUpdate={refetchTradeShipment}
            />
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FBFF]">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-[#6B8CA8]">Nachrichten werden geladen...</p>
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[#6B8CA8]">Schreibe die erste Nachricht!</p>
          </div>
        ) : (
          messages?.map((msg, idx) => {
            const isMine = isMyMessage(msg);
            const showDate = idx === 0 || 
              new Date(messages[idx - 1].created_date).toDateString() !== new Date(msg.created_date).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="text-center py-2">
                    <span className="text-xs text-[#6B8CA8] bg-white px-3 py-1 rounded-full">
                      {format(new Date(msg.created_date), 'dd. MMMM yyyy', { locale: de })}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isMine ? 'order-2' : ''}`}>
                    {msg.type === 'trade_offer' && (
                      <div className="mb-2 flex items-center gap-2 text-xs text-[#A8D5F2]">
                        <ArrowRightLeft className="w-3 h-3" />
                        Tauschanfrage
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl ${
                      isMine 
                        ? 'bg-[#A8D5F2] text-white rounded-br-md' 
                        : 'bg-white text-[#2A4D66] rounded-bl-md border border-[#E0EEF8]'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                      <span className="text-xs text-[#6B8CA8]">
                        {format(new Date(msg.created_date), 'HH:mm')}
                      </span>
                      {isMine && (
                        msg.read ? (
                          <CheckCheck className="w-3 h-3 text-[#A8D5F2]" />
                        ) : (
                          <Check className="w-3 h-3 text-[#6B8CA8]" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t border-[#E0EEF8] p-4">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            className="flex-1 h-12 border-[#E0EEF8] focus:ring-[#A8D5F2] rounded-xl"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="h-12 px-6 bg-[#A8D5F2] hover:bg-[#7AB8E8] rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}