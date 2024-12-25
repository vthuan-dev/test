import { responseError, responseSuccess } from "../helpers/response";
import { connection } from "../database";

export const createConversation = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Kiểm tra xem đã có cuộc hội thoại active chưa
    const [existingConversation] = await connection.promise().query(
      `SELECT * FROM conversations 
       WHERE user_id = ? AND status = 'ACTIVE'`,
      [user_id]
    );

    if (existingConversation.length > 0) {
      return responseSuccess(res, {
        message: "Cuộc hội thoại đã tồn tại",
        data: existingConversation[0]
      });
    }

    // Tạo cuộc hội thoại mới
    const [result] = await connection.promise().query(
      `INSERT INTO conversations (user_id) VALUES (?)`,
      [user_id]
    );

    const data = {
      id: result.insertId,
      user_id,
      status: 'ACTIVE'
    };

    return responseSuccess(res, {
      message: "Tạo cuộc hội thoại thành công",
      data
    });
  } catch (error) {
    return responseError(res, error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, sender_id, message } = req.body;

    const [result] = await connection.promise().query(
      `INSERT INTO messages (conversation_id, sender_id, message)
       VALUES (?, ?, ?)`,
      [conversation_id, sender_id, message]
    );

    const data = {
      id: result.insertId,
      conversation_id,
      sender_id,
      message,
      created_at: new Date()
    };

    return responseSuccess(res, {
      message: "Gửi tin nhắn thành công",
      data
    });
  } catch (error) {
    return responseError(res, error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;

    const [messages] = await connection.promise().query(
      `SELECT m.*, u.username, u.user_type
       FROM messages m
       JOIN user u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversation_id]
    );

    return responseSuccess(res, {
      message: "Lấy tin nhắn thành công",
      data: messages
    });
  } catch (error) {
    return responseError(res, error);
  }
};

export const getConversations = async (req, res) => {
  try {
    const { user_id, user_type } = req.query;
    
    let query = `
      SELECT c.*, 
             u.username as user_name,
             (SELECT COUNT(*) FROM messages m 
              WHERE m.conversation_id = c.id 
              AND m.is_read = 0 
              AND m.sender_id != ?) as unread_count,
             (SELECT MAX(created_at) FROM messages 
              WHERE conversation_id = c.id) as last_message_time
      FROM conversations c
      JOIN user u ON c.user_id = u.id
      WHERE 1=1
    `;

    const queryParams = [user_id];

    // Nếu là user thường, chỉ lấy conversations của user đó
    if (user_type === 2) {
      query += ` AND c.user_id = ?`;
      queryParams.push(user_id);
    }

    query += ` GROUP BY c.id ORDER BY COALESCE(last_message_time, '1970-01-01') DESC`;

    const [conversations] = await connection.promise().query(query, queryParams);

    return responseSuccess(res, {
      message: "Lấy danh sách hội thoại thành công",
      data: conversations
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return responseError(res, error);
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { user_id } = req.body;

    await connection.promise().query(
      `UPDATE messages 
       SET is_read = 1 
       WHERE conversation_id = ? 
       AND sender_id != ?`,
      [conversation_id, user_id]
    );

    return responseSuccess(res, {
      message: "Đánh dấu tin nhắn đã đọc thành công"
    });
  } catch (error) {
    return responseError(res, error);
  }
};