import BaseModel from "./base.model";

class CartModel extends BaseModel {
  constructor() {
    super({
      table: "cart",
      fillable: ["id", "user_id", "product_id", "quantity", "room_id"],
    });
  }

  getCartRoomByUserId(userId) {
    return new Promise((resolve, reject) => {
      const queryRoom = `
  SELECT  ${this.table}.id as cart_id, ${this.table}.*, room.*
  FROM cybergame.${this.table}
  INNER JOIN room ON room.id = ${this.table}.room_id
  WHERE ${this.table}.type = 1
    AND ${this.table}.user_id = ${userId}
`;
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

  getCartProductByUserId(userId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `
   SELECT ${this.table}.id, ${this.table}.*, product.* 
   FROM cybergame.${this.table}
   LEFT JOIN product ON product.id = ${this.table}.product_id
   WHERE ${this.table}.type = 0 
   AND ${this.table}.user_id = ${userId}`;

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

export default new CartModel();
