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
      
      // Chỉ log khi cần debug
      // console.log('Raw API response:', response);

      if (response.data && response.data.isSuccess && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          message: response.data.message,
          status: 200
        };
      }
      
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          message: 'Success',
          status: 200
        };
      }
      
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
      console.log('Raw messages response:', response);

      // Kiểm tra response format mới
      if (response.data && response.data.isSuccess && response.data.data && response.data.data.messages) {
        return {
          data: response.data.data.messages,
          message: response.data.message,
          status: 200
        };
      }

      // Kiểm tra nếu messages nằm trực tiếp trong data
      if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
        return {
          data: response.data.messages,
          message: 'Success',
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
      // Bỏ console.log không cần thiết
      const response = await axiosInstance.post('/chat/messages', data);
      return response.data; // Trả về data trực tiếp
    } catch (error: any) {
      console.error('Error sending message:', error.response?.data);
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

  // Cập nhật trạng thái conversation
  async updateConversationStatus(conversation_id: number, data: {
    last_message?: string;
    unread_count?: number;
  }): Promise<void> {
    try {
      await axiosInstance.put(`/chat/conversations/${conversation_id}/status`, data);
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  }

  // Thêm method để lấy tin nhắn realtime
  async getRealtimeMessages(conversation_id: number): Promise<AxiosResponseData<Message[]>> {
    try {
      const response = await axiosInstance.get(`/chat/messages/${conversation_id}/realtime`);
      return response.data;
    } catch (error) {
      console.error('Error getting realtime messages:', error);
      throw error;
    }
  }
}

// Export single instance
export const chatService = new ChatService(); 