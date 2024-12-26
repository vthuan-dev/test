import BaseModel from "./base.model";

class OrderModel extends BaseModel {
  constructor() {
    super({
      table: "orders",
      fillable: ["id", "user_id", "total_money", "status", "description", "payment_method"],
    });
  }

  getRoomOrderDetail(orderId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          rod.id,           -- ID của room_order_detail
          r.id as room_id,  -- ID của room
          r.room_name,
          r.price as room_price,
          rod.start_time,
          rod.end_time,
          rod.total_time,
          rod.total_price,
          r.status as room_status
        FROM room_order_detail rod
        INNER JOIN room r ON rod.room_id = r.id
        WHERE rod.order_id = ?
      `;

      this.connection.query(query, [orderId], (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.length !== 0) {
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  }

  getRoomOrderDetailByUserId(userId) {
    const queryRoom = `SELECT * FROM cybergame.room_order_detail right join orders on orders.id = room_order_detail.order_id left join room on room.id = room_order_detail.room_id where orders.user_id = ${userId}`;
    this.connection.query(queryRoom, (error, result) => {
      if (error) {
        reject(error);
      } else if (result && result?.length !== 0) {
        resolve(result);
      }
      resolve();
    });
  }

  getProductOrderDetailByUserId(userId) {
    const queryRoom = `SELECT * FROM cybergame.order_detail left join orders on orders.id = order_detail.order_id left join product on order_detail.product_id = product.id where orders.user_id = ${userId}`;
    this.connection.query(queryRoom, (error, result) => {
      if (error) {
        reject(error);
      } else if (result && result?.length !== 0) {
        resolve(result);
      }
      resolve();
    });
  }

  getProductOrderDetail(orderId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `SELECT * FROM cybergame.order_detail right join product on product.id = order_detail.product_id where order_detail.order_id = ${orderId}`;
      this.connection.query(queryProduct, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }
  statisticProduct(orderId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `SELECT p.id, p.product_name, p.price, SUM(id.quantity) AS sold_quantity,
       p.price * SUM(id.quantity) AS total_price
FROM order_detail id
JOIN product p ON id.product_id = p.id
GROUP BY p.id, p.product_name, p.price
ORDER BY sold_quantity DESC
LIMIT 5;`;
      this.connection.query(queryProduct, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }
  statisticRoom(orderId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `
      SELECT p.id, p.room_name, p.price, COUNT(id.room_id) AS sold_quantity,
       SUM(p.price) AS total_price
FROM room_order_detail id
JOIN room p ON id.room_id = p.id
GROUP BY p.id, p.room_name, p.price
ORDER BY sold_quantity DESC
LIMIT 5;`;
      this.connection.query(queryProduct, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }

  statisticTotalPrice(startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      let queryProduct = `
        SELECT SUM(total_money) AS total_revenue
        FROM orders
      `;
      
      let params = [];

      // Chỉ thêm điều kiện WHERE khi có startDate và endDate
      if (startDate && endDate) {
        queryProduct += ` WHERE created_at BETWEEN ? AND ?`;
        // Chuyển đổi endDate để bao gồm cả ngày kết thúc
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        
        params = [new Date(startDate), endDateTime];
      }

      this.connection.query(queryProduct, params, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.length !== 0) {
          resolve(result[0]); // Trả về trực tiếp object chứa total_revenue
        } else {
          resolve({ total_revenue: 0 }); // Trả về 0 nếu không có dữ liệu
        }
      });
    });
  }

  getOrderDetail(orderId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          o.id as order_id,
          o.user_id,
          o.total_money,
          o.order_date,
          o.status as order_status,
          o.payment_method,
          o.payment_status,
          o.description,
          u.username,
          u.email,
          u.phone,
          u.is_vip,
          u.vip_end_date,
          rod.id as room_detail_id,
          rod.room_id,
          r.room_name,
          rod.start_time,
          rod.end_time,
          rod.total_time,
          rod.total_price,
          r.status as room_status
        FROM orders o
        LEFT JOIN user u ON o.user_id = u.id
        LEFT JOIN room_order_detail rod ON o.id = rod.order_id
        LEFT JOIN room r ON rod.room_id = r.id
        WHERE o.id = ?
      `;

      this.connection.query(query, [orderId], (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.length !== 0) {
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  }
}

export default new OrderModel();
