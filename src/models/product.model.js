import BaseModel from "./base.model";

class ProductModel extends BaseModel {
  constructor() {
    super({
      table: "product",
      fillable: [
        "id",
        "image_url",
        "product_name",
        "price",
        "category_id",
        "description",
      ],
    });
  }
}

export default new ProductModel();
