import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
import orderModel from "../models/order.model";
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constant';

const config = {
  tmnCode: process.env.VNPAY_TMNCODE,
  secretKey: process.env.VNPAY_SECRET_KEY,
  vnpUrl: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL
};

export function createPayment(req, res, next) {
  try {
    const { amount, orderId } = req.body;
    console.log('Creating payment with:', { amount, orderId });
    
    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const { returnUrl, secretKey, tmnCode } = config;
    let vnpUrl = config.vnpUrl;
    const date = new Date();

    let createDate = moment(date).format("YYYYMMDDHHmmss");

    // const amount = 100000;
    // const bankCode = "ACB";
    const orderInfo = "Noi dung thanh toan";
    const orderType = "billpayment ";
    const locale = "vn";
    if (locale === null || locale === "") {
      locale = "vn";
    }
    const currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    // if (bankCode !== null && bankCode !== "") {
    //   vnp_Params["vnp_BankCode"] = bankCode;
    // }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    console.log('VNPay URL:', vnpUrl);
    res.redirect(vnpUrl);
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
  const connection = await orderModel.connection.promise();
  try {
    console.log("Request query params:", req.query);
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", config.secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      if (rspCode === "00") {
        try {
          await connection.beginTransaction();
          
          // Bỏ updated_at vì không có trong bảng
          await connection.query(
            `UPDATE orders 
             SET payment_status = ?, status = ?
             WHERE id = ?`,
            ['PAID', 'CONFIRMED', orderId]
          );

          await connection.commit();

          return res.status(200).json({
            success: true,
            code: "00",
            message: "Thanh toán thành công"
          });
        } catch (dbError) {
          await connection.rollback();
          console.error("Database update error:", dbError);
          return res.status(500).json({
            success: false,
            code: "99",
            message: "Lỗi cập nhật database"
          });
        }
      }

      return res.status(400).json({
        success: false,
        code: rspCode,
        message: "Thanh toán thất bại"
      });
    }

    return res.status(400).json({
      success: false,
      code: "97",
      message: "Chữ ký không hợp lệ" 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Payment callback error:", error);
    return res.status(500).json({
      success: false,
      code: "99",
      message: error.message || "Lỗi server"
    });
  }
}
