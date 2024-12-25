import createInstance from '~/app/configs/api/axios-config';

const axiosInstance = createInstance(import.meta.env.VITE_BASE_URL_API || '');

// Types
export interface Conversation {
  id: number;
  user_id: number;
  user_name: string;
  unread_count: number;
  last_message_time: string;
  status: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  username: string;
  user_type: number;
}

export interface AxiosResponseData<T> {
  data: T;
  message: string;
  status: number;
}

class ChatService {
  // Lấy danh sách cuộc hội thoại
  async getConversations(user_id: number, user_type: number): Promise<AxiosResponseData<Conversation[]>> {
    try {
      return await axiosInstance.get('/chat/conversations', {
        params: { user_id, user_type }
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Lấy tin nhắn của cuộc hội thoại
  async getMessages(conversation_id: number): Promise<AxiosResponseData<Message[]>> {
    try {
      const response = await axiosInstance.get(`/chat/messages/${conversation_id}`);
      console.log('Messages response:', response);
      return response;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Gửi tin nhắn mới
  async sendMessage(data: {
    conversation_id: number;
    sender_id: number;
    message: string;
  }): Promise<AxiosResponseData<Message>> {
    try {
      console.log('Sending to API:', data);
      const response = await axiosInstance.post('/chat/messages', data);
      console.log('API Response:', response);
      return response;
    } catch (error: any) {
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessagesAsRead(conversation_id: number, user_id: number): Promise<void> {
    try {
      await axiosInstance.put(`/chat/messages/read/${conversation_id}`, {
        user_id
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Tạo cuộc hội thoại mới hoặc lấy cuộc hội thoại hiện có
  async createConversation(user_id: number): Promise<AxiosResponseData<Conversation>> {
    try {
      return await axiosInstance.post('/chat/conversations', {
        user_id
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
}

// Export single instance
export const chatService = new ChatService(); 