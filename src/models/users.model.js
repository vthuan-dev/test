import BaseModel from "./base.model";
import bcrypt from "bcrypt";

class UserModel extends BaseModel {
  constructor() {
    super({
      table: "user",
      fillable: [
        "id",
        "username",
        "email",
        "password",
        "vip_end_date",
        "vip_start_date",
        "is_vip",
        "user_type",
      ],
    });
  }

  //   mã hóa mật password
  async bcryptPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  //   so sánh === password
  async authenticate(inputPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
    return isMatch;
  }
}

export default new UserModel();
