import BaseModel from "./base.model";

class OrderRoomModel extends BaseModel {
  constructor() {
    super({
      table: "room_order_detail",
      fillable: [
        "id",
        "order_id",
        "room_id",
        "start_time",
        "end_time",
        "total_time",
        "total_price",
      ],
    });
  }
}

export default new OrderRoomModel();
