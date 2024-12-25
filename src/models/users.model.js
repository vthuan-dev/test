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
        "phone",
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
    console.log('Input password:', inputPassword);  // admin123
    console.log('Hashed password from DB:', hashedPassword); // $2b$10$S53r...
    const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
    console.log('bcrypt compare result:', isMatch); // true/false
    return isMatch;
  }

  async updateById(id, updates) {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    // Tạo câu truy vấn SQL
    const setClause = keys.map((key) => `${key} = ?`).join(", "); // Tạo chuỗi cho phần SET
    const query = `UPDATE ${this.table} SET ${setClause} WHERE id = ?`;

    // Kết hợp các giá trị vào một mảng
    const params = [...values, id];

    console.log("Query:", query);
    console.log("Params:", params);

    try {
      // Sử dụng promise version của query
      const [result] = await this.connection.promise().query(query, params); // Đảm bảo gọi promise()

      console.log("Execution Result:", result); // Log toàn bộ kết quả

      // Kiểm tra cấu trúc của kết quả
      if (result && typeof result === "object") {
        // Truy cập vào affectedRows
        const affectedRows = result.affectedRows;

        return affectedRows > 0 ? updates : null; // Trả về thông tin bản ghi đã cập nhật
      } else {
        console.error("Unexpected result format:", result);
        throw new Error("Unexpected result format");
      }
    } catch (error) {
      console.error("Error executing update query: ", error);
      throw error; // Ném lại lỗi để xử lý trong controller
    }
  }
}

export default new UserModel();
