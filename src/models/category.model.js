import BaseModel from "./base.model";

class CategoryModel extends BaseModel {
  constructor() {
    super({
      table: "category",
      fillable: ["id", "category_name", "description"],
    });
  }
}

export default new CategoryModel();
