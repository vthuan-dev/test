import BaseModel from "./base.model";

class OrderDetailModel extends BaseModel {
  constructor() {
    super({
      table: "order_detail",
      fillable: ["id", "order_id", "product_id", "quantity", "price"],
    });
  }
}

export default new OrderDetailModel();
