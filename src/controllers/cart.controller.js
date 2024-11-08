import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import cartModel from "../models/cart.model";

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    // const { isPagination, ...pagination } = await getPagination(
    //   cartModel,
    //   query
    // );

    // const product = await cartModel.read(query, false);

    const [cartRoom, cartProduct] = await Promise.all([
      cartModel.getCartRoomByUserId(query.user_id),
      cartModel.getCartProductByUserId(query.user_id),
    ]);

    // console.log("🚀 ~ cartProduct:", cartProduct);
    // console.log("🚀 ~ cartRoom:", cartRoom);

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

export const create = async (req, res) => {
  try {
    const { user_id, product_id, room_id, type, quantity } = req.body;

    // Bước 1: Kiểm tra sự tồn tại của bản ghi
    let selectQuery;
    let selectParams = [user_id];

    if (type === 0) {
      selectQuery = `
        SELECT * FROM cart
        WHERE user_id = ? AND product_id = ? AND type = 0;
      `;
      selectParams.push(product_id);
    } else if (type === 1) {
      selectQuery = `
        SELECT * FROM cart
        WHERE user_id = ? AND room_id = ? AND type = 1;
      `;
      selectParams.push(room_id);
    }

    const [existingCart] = await cartModel.connection
      .promise()
      .query(selectQuery, selectParams);

    if (existingCart.length > 0) {
      // Bản ghi đã tồn tại, thực hiện cập nhật quantity
      const updateQuery = `
        UPDATE cart
        SET quantity = quantity + ?
        WHERE id = ?;
      `;
      const updateParams = [quantity, existingCart[0].id];
      await cartModel.connection.promise().query(updateQuery, updateParams);

    } else {
      // Bản ghi chưa tồn tại, thêm mới
      const insertQuery = `
        INSERT INTO cart (user_id, product_id, quantity, type, room_id, created_at)
        VALUES (?, ?, ?, ?, ?, NOW());
      `;
      await cartModel.connection.promise().query(insertQuery, [
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
