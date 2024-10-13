import BaseModel from "./base.model";

class OrderModel extends BaseModel {
  constructor() {
    super({
      table: "orders",
      fillable: ["id", "user_id", "total_money", "status", "description"],
    });
  }

  getRoomOrderDetail(orderId) {
    return new Promise((resolve, reject) => {
      const queryRoom = `SELECT * FROM cybergame.room_order_detail right join room on room.id = room_order_detail.room_id where room_order_detail.order_id = ${orderId}`;
      this.connection.query(queryRoom, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
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
}

export default new OrderModel();
