import { responseError, responseSuccess } from "../helpers/response";
import { connection } from "../database";

// 1. Tạo cuộc hội thoại mới hoặc lấy cuộc hội thoại hiện có
export const createConversation = async (req, res) => {
  const conn = await connection.promise();
  try {
    await conn.beginTransaction();
    
    const { user_id } = req.body;
    
    // Kiểm tra cuộc hội thoại active hiện có
    const [existingConversation] = await conn.query(
      `SELECT c.*, u.username, u.user_type,
        (SELECT message FROM messages 
         WHERE conversation_id = c.id 
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at 
         FROM messages 
         WHERE conversation_id = c.id 
         ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN user u ON c.user_id = u.id 
       WHERE c.user_id = ? AND c.status = 'ACTIVE'`,
      [user_id]
    );

    if (existingConversation.length > 0) {
      await conn.commit();
      return responseSuccess(res, {
        message: "Cuộc hội thoại đã tồn tại",
        data: existingConversation[0]
      });
    }

    // Tìm admin có ít cuộc hội thoại active nhất
    const [availableAdmin] = await conn.query(`
      SELECT u.id, u.username, u.user_type
      FROM user u
      LEFT JOIN conversations c ON u.id = c.admin_id AND c.status = 'ACTIVE'
      WHERE u.user_type = 1
      GROUP BY u.id
      ORDER BY COUNT(c.id) ASC
      LIMIT 1
    `);

    if (!availableAdmin.length) {
      await conn.rollback();
      return responseError(res, {
        message: "Không tìm thấy admin"
      });
    }

    // Lấy thông tin user
    const [userInfo] = await conn.query(
      `SELECT username, user_type FROM user WHERE id = ?`,
      [user_id]
    );

    // Tạo cuộc hội thoại mới
    const [result] = await conn.query(
      `INSERT INTO conversations (user_id, admin_id, status) VALUES (?, ?, 'ACTIVE')`,
      [user_id, availableAdmin[0].id]
    );

    const conversationData = {
      id: result.insertId,
      user_id,
      admin_id: availableAdmin[0].id,
      status: 'ACTIVE',
      created_at: new Date(),
      username: userInfo[0]?.username,
      user_type: userInfo[0]?.user_type,
      user_name: userInfo[0]?.username, // Thêm trường này để đồng bộ với frontend
      last_message: null,
      last_message_time: null,
      unread_count: 0
    };

    await conn.commit();

    // Emit socket event cho admin
    if (req.io) {
      req.io.to('admin_room').emit('new_conversation', {
        ...conversationData,
        user_name: userInfo[0]?.username,
        unread_count: 0,
        last_message: null,
        last_message_time: null
      });
    }

    return responseSuccess(res, {
      message: "Tạo cuộc hội thoại thành công",
      data: conversationData
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error in createConversation:', error);
    return responseError(res, error);
  }
};

// 2. Gửi tin nhắn với xử lý real-time
export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, sender_id, message } = req.body;

    // Kiểm tra conversation tồn tại và active
    const [conversation] = await connection.promise().query(
      `SELECT * FROM conversations WHERE id = ? AND status = 'ACTIVE'`,
      [conversation_id]
    );

    if (!conversation.length) {
      return responseError(res, {
        message: "Cuộc hội thoại không tồn tại hoặc đã kết thúc"
      });
    }

    // Lưu tin nhắn
    const [result] = await connection.promise().query(
      `INSERT INTO messages (conversation_id, sender_id, message)
       VALUES (?, ?, ?)`,
      [conversation_id, sender_id, message]
    );

    // Lấy thông tin người gửi
    const [sender] = await connection.promise().query(
      `SELECT username, user_type FROM user WHERE id = ?`,
      [sender_id]
    );

    const data = {
      id: result.insertId,
      conversation_id,
      sender_id,
      sender_name: sender[0].username,
      user_type: sender[0].user_type,
      message,
      is_read: false,
      created_at: new Date()
    };

    // Thêm try-catch cho socket emit
    try {
      if (req.io) {
        req.io.to(`conversation_${conversation_id}`).emit('new_message', data);
      }
    } catch (socketError) {
      console.error('Socket error:', socketError);
    }

    return responseSuccess(res, {
      message: "Gửi tin nhắn thành công",
      data
    });
  } catch (error) {
    return responseError(res, error);
  }
};

// 3. Lấy tin nhắn với phân trang và thông tin chi tiết
export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Lấy tin nhắn với thông tin người gửi
    const [messages] = await connection.promise().query(
      `SELECT m.*, u.username, u.user_type,
        DATE_FORMAT(m.created_at, '%H:%i:%s %d-%m-%Y') as formatted_time
       FROM messages m
       JOIN user u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversation_id, Number(limit), offset]
    );

    // Đếm tổng số tin nhắn
    const [total] = await connection.promise().query(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
      [conversation_id]
    );

    return responseSuccess(res, {
      message: "Lấy tin nhắn thành công",
      data: {
        messages: messages.reverse(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total[0].total
        }
      }
    });
  } catch (error) {
    return responseError(res, error);
  }
};

// 4. Lấy danh sách hội thoại với thông tin mới nhất
export const getConversations = async (req, res) => {
  const conn = await connection.promise();
  try {
    const user_id = Number(req.query.user_id);
    const user_type = Number(req.query.user_type);

    console.log('Getting conversations for:', { user_id, user_type });

    let baseQuery = `
      SELECT 
        c.*,
        u.username as user_name,
        u.user_type,
        COALESCE(
          (SELECT COUNT(*) 
           FROM messages m 
           WHERE m.conversation_id = c.id 
           AND m.is_read = 0 
           AND m.sender_id != ?), 0
        ) as unread_count,
        (SELECT message 
         FROM messages m2 
         WHERE m2.conversation_id = c.id 
         ORDER BY m2.created_at DESC LIMIT 1) as last_message,
        (SELECT DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.000Z')
         FROM messages m3 
         WHERE m3.conversation_id = c.id 
         ORDER BY m3.created_at DESC LIMIT 1) as last_message_time
      FROM conversations c
      LEFT JOIN user u ON c.user_id = u.id
      WHERE c.status = 'ACTIVE'
    `;

    const queryParams = [user_id];

    // Nếu là khách hàng (user_type = 2)
    if (user_type === 2) {
      baseQuery += ` AND c.user_id = ?`;
      queryParams.push(user_id);
    }
    // Nếu là admin (user_type = 1)
    else if (user_type === 1) {
      // Admin thấy tất cả cuộc trò chuyện ACTIVE
      // Không cần thêm điều kiện
    }

    // Sắp xếp theo thời gian tin nhắn mới nhất hoặc thời gian tạo
    baseQuery += ` 
      ORDER BY 
        COALESCE(
          (SELECT created_at 
           FROM messages m4 
           WHERE m4.conversation_id = c.id 
           ORDER BY m4.created_at DESC LIMIT 1),
          c.created_at
        ) DESC,
        c.id DESC
    `;

    console.log('Final Query:', baseQuery);
    console.log('Query Params:', queryParams);

    const [conversations] = await conn.query(baseQuery, queryParams);
    
    console.log(`Found ${conversations.length} conversations:`, conversations);

    return responseSuccess(res, {
      message: "Lấy danh sách hội thoại thành công",
      data: conversations
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return responseError(res, error);
  }
};

// 5. Đánh dấu tin nhắn đã đọc
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

    // Emit socket event để cập nhật UI
    req.io.to(`conversation_${conversation_id}`).emit('messages_read', {
      conversation_id,
      reader_id: user_id
    });

    return responseSuccess(res, {
      message: "Đánh dấu tin nhắn đã đọc thành công"
    });
  } catch (error) {
    return responseError(res, error);
  }
};

// 6. Kết thúc cuộc hội thoại
export const closeConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { user_id, user_type } = req.body;

    // Kiểm tra quyền kết thúc hội thoại
    const [conversation] = await connection.promise().query(
      `SELECT * FROM conversations WHERE id = ?`,
      [conversation_id]
    );

    if (!conversation.length) {
      return responseError(res, {
        message: "Cuộc hội thoại không tồn tại"
      });
    }

    // Chỉ admin hoặc chủ cuộc hội thoại mới được kết thúc
    if (user_type !== 1 && conversation[0].user_id !== user_id) {
      return responseError(res, {
        message: "Không có quyền thực hiện"
      });
    }

    await connection.promise().query(
      `UPDATE conversations 
       SET status = 'CLOSED', updated_at = NOW() 
       WHERE id = ?`,
      [conversation_id]
    );

    // Thông báo cho tất cả người dùng trong cuộc hội thoại
    req.io.to(`conversation_${conversation_id}`).emit('conversation_closed', {
      conversation_id,
      closed_by: user_id
    });

    return responseSuccess(res, {
      message: "Kết thúc cuộc hội thoại thành công"
    });
  } catch (error) {
    return responseError(res, error);
  }
};