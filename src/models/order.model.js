import BaseModel from "./base.model";

class OrderModel extends BaseModel {
  constructor() {
    super({
      table: "order",
      fillable: ["id", "user_id", "total_money", "order_date", "status"],
    });
  }
}

export default new OrderModel();
