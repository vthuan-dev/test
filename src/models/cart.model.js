import BaseModel from "./base.model";

class CartModel extends BaseModel {
  constructor() {
    super({
      table: "cart",
      fillable: ["id", "user_id", "product_id", "quantity"],
    });
  }
}

export default new CartModel();
