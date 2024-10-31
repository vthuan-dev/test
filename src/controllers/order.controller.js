import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import cartModel from "../models/cart.model";
import orderModel from "../models/order.model";
import orderDetailModel from "../models/order-detail.model";
import orderRoomModel from "../models/order-room.model";
import { ORDER_STATUS, ORDER_TYPE } from "../config/constant";

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      orderModel,
      query
    );

    const product = await orderModel.read(query, isPagination);

    const data = {
      message: "Lấy danh sách thành công.",
      data: product,
      pagination,
    };
    responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const create = async (req, res) => {
  try {
    const { carts, products, orderType, rooms, orders, ...remainBody } =
      req.body;
    console.log(req.body)
    const result = await orderModel.create({
      ...remainBody,
      status: ORDER_STATUS.CONFIRMED,
    });

    const order_id = result?.insertId;

    const productWithOrderId = [];
    const roomWithOrderId = [];

    if (products && products.length > 0) {
      products.forEach((product) => {
        productWithOrderId.push({
          ...product,
          product_id: parseInt(product.product_id),
          order_id,
        });
      });
      orderDetailModel.createMultiple(productWithOrderId)
    }

    if (rooms && rooms.length > 0) {
      const InValueRoom = []
      rooms.map((room) => {
        InValueRoom.push(table.tableId);
        roomWithOrderId.push({
          ...room,
          room_id: parseInt(product.room_id),
          order_id,
        });
      });
      orderRoomModel.createMultiple(roomWithOrderId)
    }

    if(carts && carts.length > 0) { 
      await cartModel.deleteMultple("id", carts);
    }

    const response = {
      data: result,
      message: "Tạo mới hóa đơn thành công",
    };
    responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
      console.log('req.body:', req.body)
};

export const getDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [room, product, detail] = await Promise.all([
      orderModel.getRoomOrderDetail(id),
      orderModel.getProductOrderDetail(id),
      orderModel.findOne({ id }),
    ]);
    const data = {
      message: "Lấy danh sách thành công.",
      data: { room, product, detail },
    };
    responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};
// export const getDetailByUserId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [room, product, detail] = await Promise.all([
//       orderModel.getRoomOrderDetailByUserId(id),
//       orderModel.getProductOrderDetailByUserId(id),
//       orderModel.findOne({ id }),
//     ]);
//     const data = {
//       message: "Lấy danh sách thành công.",
//       data: { room, product, detail },
//     };
//     responseSuccess(res, data);
//   } catch (error) {
//     return responseError(res, error);
//   }
// };

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedCategory = await orderModel.update("id", id, body);
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
    const category = await orderModel.findOne({ id });

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
    const category = await orderModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticProductOrder = async (req, res) => {
  try {
    const response = await orderModel.statisticProduct();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticRoomOrder = async (req, res) => {
  try {
    const response = await orderModel.statisticRoom();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticTotalPrice = async (req, res) => {
  try {
    const response = await orderModel.statisticTotalPrice();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};
