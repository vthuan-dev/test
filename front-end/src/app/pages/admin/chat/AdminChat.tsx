import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { io } from "socket.io-client";
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { AdminChatList } from './components/AdminChatList';
import { AdminChatBox } from './components/AdminChatBox';
import { chatService } from '~/services/chat.service';
import useAuth from '~/app/redux/slices/auth.slice';
import ErrorBoundary from '~/app/components/ErrorBoundary';

const socket = io('http://localhost:5001');

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      
      // Socket events
      socket.on('new_message', handleNewMessage);
      socket.on('messages_read', handleMessagesRead);
      socket.on('conversation_closed', handleConversationClosed);

      return () => {
        socket.off('new_message');
        socket.off('messages_read');
        socket.off('conversation_closed');
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await chatService.getConversations(user.id, 1);
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    socket.emit('join_conversation', conversation.id);
    
    try {
      const response = await chatService.getMessages(conversation.id);
      setMessages(response.data.messages);
      
      // Mark messages as read
      await chatService.markMessagesAsRead(conversation.id, user.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (message.conversation_id === selectedConversation?.id) {
      setMessages(prev => [...prev, message]);
    }
    fetchConversations(); // Update unread counts
  };

  const handleMessagesRead = ({ conversation_id }) => {
    if (conversation_id === selectedConversation?.id) {
      setMessages(prev => 
        prev.map(msg => ({ ...msg, is_read: true }))
      );
    }
  };

  const handleConversationClosed = ({ conversation_id }) => {
    fetchConversations();
    if (conversation_id === selectedConversation?.id) {
      setSelectedConversation(null);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <BaseBreadcrumbs arialabel="Chat với khách hàng">
      <Box sx={{ height: 'calc(100vh - 180px)' }}>
        <ErrorBoundary>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={3}>
              <AdminChatList 
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                loading={loading}
              />
            </Grid>
            <Grid item xs={9}>
              <AdminChatBox 
                conversation={selectedConversation}
                messages={messages}
                currentUser={user}
                socket={socket}
                onMessageSent={fetchConversations}
              />
            </Grid>
          </Grid>
        </ErrorBoundary>
      </Box>
    </BaseBreadcrumbs>
  );
};

export default AdminChat; 