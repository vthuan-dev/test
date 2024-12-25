import createInstance from '~/app/configs/api/axios-config';

const axiosInstance = createInstance(import.meta.env.VITE_BASE_URL_API || '');

// Types
export interface Conversation {
  id: number;
  user_id: number;
  admin_id: number | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  user_name: string;
  user_type: number;
  unread_count: number;
  last_message: string | null;
  last_message_time: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  username: string;
  user_type: number;
  is_read: boolean;
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
      if (!user_id || !user_type) {
        throw new Error('Missing required parameters');
      }

      const params = new URLSearchParams();
      params.append('user_id', user_id.toString());
      params.append('user_type', user_type.toString());

      const response = await axiosInstance.get('/chat/conversations', { params });
      console.log('Raw API response:', response);

      // Kiểm tra response format mới
      if (response.data && response.data.isSuccess && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          message: response.data.message,
          status: 200
        };
      }
      
      console.warn('Invalid response format:', response.data);
      return {
        data: [],
        message: 'No conversations found',
        status: 200
      };
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Lấy tin nhắn của cuộc hội thoại
  async getMessages(conversation_id: number): Promise<AxiosResponseData<Message[]>> {
    try {
      const response = await axiosInstance.get(`/chat/messages/${conversation_id}`);
      console.log('Raw messages response:', response); // Debug log

      // Kiểm tra và trả về messages array
      if (response.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          message: response.data.message || 'Success',
          status: 200
        };
      }

      console.warn('Invalid messages format:', response.data);
      return {
        data: [],
        message: 'No messages found',
        status: 200
      };
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

  // Đ��nh dấu tin nhắn đã đọc
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