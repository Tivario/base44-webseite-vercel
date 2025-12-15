import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../../utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InterestedUsers({ product }) {
  const [open, setOpen] = useState(false);

  const { data: interestedUsers, isLoading } = useQuery({
    queryKey: ['interested-users', product.id],
    queryFn: async () => {
      const favorites = await base44.entities.Favorite.filter({ 
        product_id: product.id 
      });
      
      // Get user details for each favorite
      const userEmails = [...new Set(favorites.map(f => f.user_email))];
      const users = await base44.entities.User.list();
      
      return users.filter(u => userEmails.includes(u.email));
    },
    enabled: open,
  });

  const handleStartChat = async (targetUser) => {
    try {
      // Check if conversation already exists
      const existing = await base44.entities.Conversation.filter({
        product_id: product.id,
        seller_email: product.seller_email,
        buyer_email: targetUser.email
      });

      let conversationId;
      if (existing.length > 0) {
        conversationId = existing[0].id;
      } else {
        // Create new conversation
        const conv = await base44.entities.Conversation.create({
          product_id: product.id,
          product_title: product.title,
          product_image: product.images?.[0] || '',
          seller_email: product.seller_email,
          buyer_email: targetUser.email,
          type: 'kauf',
          status: 'aktiv',
          last_message: `Hallo! Ich habe gesehen, dass du "${product.title}" favorisiert hast.`,
          last_message_date: new Date().toISOString()
        });
        conversationId = conv.id;

        // Create initial message
        await base44.entities.Message.create({
          conversation_id: conversationId,
          sender_email: product.seller_email,
          content: `Hallo! Ich habe gesehen, dass du "${product.title}" favorisiert hast. Hast du Interesse?`,
          type: 'text'
        });
      }

      window.location.href = createPageUrl(`Chat?id=${conversationId}`);
    } catch (err) {
      toast.error('Fehler beim Öffnen des Chats');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-[#E0EEF8]">
          <Users className="w-4 h-4 mr-2" />
          Interessenten anzeigen ({product.favorites_count || 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#2A4D66]">Interessierte Nutzer</DialogTitle>
          <DialogDescription>
            Nutzer, die "{product.title}" favorisiert haben
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#7AB8E8] animate-spin" />
            </div>
          ) : !interestedUsers || interestedUsers.length === 0 ? (
            <p className="text-center text-[#6B8CA8] py-8">
              Noch keine Interessenten
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {interestedUsers.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-3 bg-[#EBF5FF] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {user.profile_image ? (
                        <AvatarImage src={user.profile_image} alt={user.display_name || user.full_name} />
                      ) : (
                        <AvatarFallback className="bg-[#A8D5F2] text-white">
                          {(user.display_name || user.full_name || user.email)?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#2A4D66]">
                        {user.display_name || user.full_name || 'Nutzer'}
                      </p>
                      {user.city && (
                        <p className="text-sm text-[#6B8CA8]">{user.city}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartChat(user)}
                    className="bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}