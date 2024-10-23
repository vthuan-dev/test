import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import cartModel from "../models/cart.model";

export const getAll = async (req, res) => {
  try {
    const { query } = req;
    console.log("🚀 ~ query:", query);

    // const { isPagination, ...pagination } = await getPagination(
    //   cartModel,
    //   query
    // );

    // const product = await cartModel.read(query, false);

    const [cartRoom, cartProduct] = await Promise.all([
      cartModel.getCartRoomByUserId(query.user_id),
      cartModel.getCartProductByUserId(query.user_id),
    ]);

    console.log("🚀 ~ cartProduct:", cartProduct);
    console.log("🚀 ~ cartRoom:", cartRoom);

    const data = {
      message: "Lấy danh sách thành công.",
      data: {
        cartRoom,
        cartProduct,
      },
    };
    responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};
// export const create = async (req, res) => {
//   try {
//     const body = req.body;

//     const result = await cartModel.create(body);

//     const response = {
//       data: result,
//       message: "Tạo mới sản phẩm thành công",
//     };
//     responseSuccess(res, response);
//   } catch (error) {
//     return responseError(res, error);
//   }
// };
export const create = async (req, res) => {
  try {
    const { user_id, product_id, room_id, type, quantity } = req.body;

    // Kiểm tra và cập nhật số lượng nếu tồn tại, nếu không thì chèn mới
    let updateQuery;
    const updateParams = [user_id]; // Khởi tạo params với user_id

    if (type === 0) {
      // Type 0 cho sản phẩm
      updateQuery = `
        UPDATE cart
        SET quantity = quantity + ?
        WHERE user_id = ? AND product_id = ? AND type = 0;
      `;
      updateParams.push(quantity, product_id); // Thêm quantity và product_id vào params
    } else if (type === 1) {
      // Type 1 cho phòng
      updateQuery = `
        UPDATE cart
        SET quantity = quantity + ?
        WHERE user_id = ? AND room_id = ? AND type = 1;
      `;
      updateParams.push(quantity, room_id); // Thêm quantity và room_id vào params
    }

    // Thực hiện cập nhật
    const [updateResult] = await cartModel.connection
      .promise()
      .query(updateQuery, updateParams);

    // Kiểm tra xem có bản ghi nào được cập nhật không
    if (updateResult.affectedRows === 0) {
      // Chèn bản ghi mới nếu không có bản ghi nào được cập nhật
      let insertQuery = `
        INSERT INTO cart (user_id, product_id, quantity, type, room_id, created_at)
        VALUES (?, ?, ?, ?, ?, NOW());
      `;

      // Chèn nếu cần
      await cartModel.connection
        .promise()
        .query(insertQuery, [
          user_id,
          product_id,
          quantity,
          type,
          type === 1 ? room_id : null,
        ]);
    }

    const response = {
      message: "Thao tác thành công",
    };
    return responseSuccess(res, response);
  } catch (error) {
    console.error("Error:", error);
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedCategory = await cartModel.update("id", id, body);
    const response = {
      message: "Cập nhật dữ liệu thành công",
      data: updatedCategory,
    };
    return responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await cartModel.findOne({ id });

    if (!category) {
      return responseNotFound(res);
    }

    const data = {
      message: "Lấy dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await cartModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};
