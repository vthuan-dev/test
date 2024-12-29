import { connection } from "../database";
import { STATUS } from "../config/status";
import { ErrorHandler } from "../helpers/response";

class BaseModel {
  constructor(props) {
    this.table = props.table;
    this.fillable = props.fillable;
    this.placeholders = this.fillable.map(() => "?").join(", ");
    this.connection = connection;
  }

  // Get All
  async read(params, isPagination = false) {
    return new Promise((resolve, reject) => {
      let searchable = "";
      if (params) {
        searchable = this.#getMultipleQuery(params);
      }
      // kiểm tra xem có search params không thì thêm vào query
      let queryExecution = `SELECT * from ${this.table} ${searchable}`;

      //  kiểm tra nếu có phân trang thì thêm vào query
      if (isPagination) {
        const page = parseInt(params.page) || 2;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;

        queryExecution = `SELECT * from ${this.table} ${searchable}  LIMIT ${limit} OFFSET ${startIndex}`;
      }
      this.connection.query(queryExecution, (error, result) => {
        this.hanldeResult(resolve, reject, error, result);
      });
    });
  }

  async totalRecord() {
    return new Promise((resolve, reject) => {
      const queryCount = `SELECT COUNT(*) as count FROM ${this.table}`;

      this.connection.query(queryCount, (error, result) => {
        this.hanldeResult(resolve, reject, error, result);
      });
    });
  }

  // Create *
  async create(data) {
    const values = [];
    const filterFields = [];
    this.fillable.forEach((field) => {
      if (data[field]) {
        filterFields.push(field);
        values.push(data[field]);
      }
    });
    const placeholders = filterFields.map(() => "?").join(", ");
    const fields = filterFields.join(", ");
    const query = `INSERT INTO ${this.table} (${fields}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, values, (error, result) => {
        this.hanldeResult(resolve, reject, error, result);
      });
    });
  }

  async createMultiple(data) {
    let fields = [];
    const [first] = data;

    if (first) {
      this.fillable.forEach((field) => {
        if (first[field]) {
          fields.push(field);
        }
      });
    }

    const insertField = fields.join(", ");

    const values = data.map((item) => {
      return fields.map((field) => item[field]);
    });
    console.log("🚀 ~ values:", values);

    function getPlaceholders(fields) {
      return "(" + Array(fields).fill("?").join(", ") + ")";
    }
    const placeholders = values
      .map(() => getPlaceholders(fields.length))
      .join(",");

    // Lấy ra một mảng các giá trị từ mảng 2D
    const flatValues = values.reduce((acc, val) => acc.concat(val), []);

    const query = `INSERT INTO ${this.table} (${insertField}) VALUES ${placeholders}`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, flatValues, (error, result) => {
        this.hanldeResult(resolve, reject, error, result);
      });
    });
  }

  // find One by cloumn name
  async findOne(params) {
    let searchable = "";

    if (params) {
      searchable = this.#getMultipleQuery(params);
    }

    return new Promise((resolve, reject) => {
      const query = `SELECT * from ${this.table} ${searchable}`;
      this.connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result[0]);
        }
        resolve();
      });
    });
  }

  // update
  async update(columnName, columnValue, data) {
    return new Promise((resolve, reject) => {
      const updates = Object.keys(data).map((field) => `${field} = ?`);

      const toStringUpdates = updates.join(", ");

      const values = Object.values(data);
      const query = `UPDATE ${this.table} SET ${toStringUpdates} WHERE ${columnName} = ?`;

      this.connection.query(
        query,
        [...values, columnValue],
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result && result?.affectedRows !== 0) {
            resolve(result);
          }
          reject(new ErrorHandler(STATUS.BAD_REQUEST, "Cập nhật thất bại"));
        }
      );
    });
  }

  async updateMultiple(inValue, columnValue, data) {
    return new Promise((resolve, reject) => {
      const updates = Object.keys(data).map((field) => `${field} = ?`);

      const toStringUpdates = updates.join(", ");
      const toStringInValue = inValue.join(", ");

      const values = Object.values(data);
      const query = `UPDATE ${this.table} SET ${toStringUpdates} WHERE ${columnValue} IN (${toStringInValue})`;

      this.connection.query(query, [...values], (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.affectedRows !== 0) {
          resolve(result);
        }
        reject(new ErrorHandler(STATUS.BAD_REQUEST, "Cập nhật thất bại"));
      });
    });
  }

  // Delete
  async delete(id) {
    const query = `DELETE FROM ${this.table} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, [id], (error, result) => {
        if (error) {
          return reject(error); // Reject the promise on error
        }

        if (result && result.affectedRows > 0) {
          return resolve(result); // Resolve the promise if rows were affected
        }

        // If no rows were affected, reject with a specific error
        reject(new ErrorHandler(STATUS.BAD_REQUEST, "Xóa thất bại"));
      });
    });
  }

  // async delete(id) {
  //   // Xác minh ID
  //   if (!id) {
  //     throw new ErrorHandler(STATUS.BAD_REQUEST, "ID là bắt buộc.");
  //   }

  //   // Loại bỏ khoảng trắng và có thể phân tích ID
  //   const trimmedId = id.trim(); // Loại bỏ bất kỳ khoảng trắng nào

  //   // Kiểm tra xem bản ghi có tồn tại không
  //   console.log("Đang kiểm tra sự tồn tại cho ID:", trimmedId); // Ghi lại ID đang được kiểm tra
  //   const exists = await this.checkIfRecordExists(trimmedId);
  //   if (!exists) {
  //     throw new ErrorHandler(STATUS.NOT_FOUND, "Không tìm thấy bản ghi."); // Xử lý bản ghi không tồn tại
  //   }

  //   const query = `DELETE FROM ${this.table} WHERE id = ?`;
  //   console.log("Thực thi truy vấn:", query, "với id:", trimmedId); // Ghi lại truy vấn xóa

  //   return new Promise((resolve, reject) => {
  //     this.connection.query(query, [trimmedId], (error, result) => {
  //       if (error) {
  //         console.error("Lỗi cơ sở dữ liệu:", error); // Ghi lại lỗi
  //         return reject(error); // Từ chối lời hứa nếu có lỗi
  //       }

  //       if (result && result.affectedRows > 0) {
  //         console.log(`Bản ghi với id ${trimmedId} đã được xóa thành công.`); // Ghi lại thông báo thành công
  //         return resolve(result); // Giải quyết lời hứa nếu có bản ghi bị ảnh hưởng
  //       }

  //       // Nếu không có bản ghi nào bị ảnh hưởng, từ chối với lỗi cụ thể
  //       reject(new ErrorHandler(STATUS.BAD_REQUEST, "Xóa thất bại")); // Không có bản ghi nào bị xóa
  //     });
  //   });
  // }

  // // Phương thức trợ giúp để kiểm tra xem bản ghi có tồn tại không
  // async checkIfRecordExists(id) {
  //   const query = `SELECT COUNT(*) AS count FROM ${this.table} WHERE id = ?`;
  //   return new Promise((resolve, reject) => {
  //     this.connection.query(query, [id], (error, result) => {
  //       if (error) {
  //         console.error("Lỗi kiểm tra sự tồn tại:", error); // Ghi lại lỗi
  //         return reject(error); // Từ chối nếu có lỗi
  //       }
  //       resolve(result[0].count > 0); // Xác nhận với true nếu số lượng lớn hơn 0
  //     });
  //   });
  // }

  async deleteMultple(columnValue, listId) {
    const toIdQuery = listId.join(", ");
    const query = ` DELETE FROM ${this.table} WHERE ${columnValue} IN (${toIdQuery})`;
    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, result) => {
        if (error) {
          resolve(error);
        } else if (result && result?.affectedRows !== 0) {
          resolve(result);
        }
        resolve({ empty: true });
      });
    });
  }

  hanldeResult(resolve, reject, error, result) {
    if (error) {
      console.log("🚀 ~ error:", error);
      return reject(error);
    }
    return resolve(result);
  }

  #getMultipleQuery({ operator = "like", ...query }) {
    let searchable = "";
    let where = "";
    this.fillable.forEach((item) => {
      const hasField = query[item];
      console.log("🚀 ~ hasField:", hasField);
      let search = operator === "like" ? `'%${hasField}%'` : `'${hasField}'`;

      if (
        hasField !== null &&
        typeof hasField !== "undefined" &&
        hasField !== ""
      ) {
        where += ` AND ${item} ${operator} ${search}`;
      }
    });
    searchable = where;

    if (where.startsWith(" AND ")) {
      searchable = "WHERE " + where.substring(" AND ".length);
    }
    return searchable;
  }
}

export default BaseModel;
