import BaseModel from "./base.model";

class DesktopModel extends BaseModel {
  constructor() {
    super({
      table: "desktop",
      fillable: ["id", "room_id", "status", "description"],
    });
  }
}

export default new DesktopModel();
