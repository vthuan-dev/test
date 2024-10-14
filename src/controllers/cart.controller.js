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
export const create = async (req, res) => {
  try {
    const body = req.body;
    // const { error } = AuthValidator.validatorRegister(req.body);
    // if (error) {
    //   return responseError(res, error);
    // }

    console.log(body);

    const result = await cartModel.create(body);

    const response = {
      data: result,
      message: "Tạo mới sản phẩm thành công",
    };
    responseSuccess(res, response);
  } catch (error) {
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
