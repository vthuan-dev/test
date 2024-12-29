import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
import orderModel from "../models/order.model";


const config = {
  tmnCode: process.env.VNPAY_TMNCODE,
  secretKey: process.env.VNPAY_SECRET_KEY,
  vnpUrl: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
};
export function createPayment(req, res, next) {
  const { amount, orderId } = req.body;
  try {
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const { returnUrl, secretKey, tmnCode } = config;
    let vnpUrl = config.vnpUrl;
    const date = new Date();

    let createDate = moment(date).format("YYYYMMDDHHmmss");

    const orderInfo = "Thanh toan don hang " + orderId;
    const orderType = "billpayment";
    const locale = "vn";
    const currCode = "VND";

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = Number(amount) * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    // Thay vì redirect, trả về URL để frontend xử lý
    res.json({
      success: true,
      vnpUrl: vnpUrl
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();

  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export async function savePayment(req, res) {
  try {
    const vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    // Xác thực chữ ký thanh toán
    // ... giữ nguyên code xác thực hiện có ...

    if (secureHash === signed) {
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus == '0') {
            if (rspCode == '00') {
              // Cập nhật trạng thái thanh toán đơn hàng
              await orderModel.update('id', orderId, {
                payment_status: 2,
                status: ORDER_STATUS.CONFIRMED
              });
              
              res.status(200).json({
                RspCode: '00',
                Message: 'Thanh toán thành công',
                success: true,
              });
            } else {
              // Thanh toán thất bại
              await orderModel.update('id', orderId, {
                payment_status: 3,
                status: ORDER_STATUS.CANCELLED
              });
              
              res.status(400).json({
                RspCode: '99',
                Message: 'Thanh toán thất bại',
                success: false,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Lỗi lưu thanh toán:', error);
    res.status(500).json({
      RspCode: '99',
      Message: 'Lỗi hệ thống',
      success: false
    });
  }
}
