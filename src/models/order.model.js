import BaseModel from "./base.model";

class OrderModel extends BaseModel {
  constructor() {
    super({
      table: "orders",
      fillable: ["id", "user_id", "total_money", "status", "description"],
    });
  }
}

export default new OrderModel();
