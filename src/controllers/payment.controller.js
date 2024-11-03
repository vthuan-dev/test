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
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl);
  } catch (error) {
    console.log(error);
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

export async function savePayment(req, res, next) {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    let orderId = vnp_Params["vnp_TxnRef"];
    let rspCode = vnp_Params["vnp_ResponseCode"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = config.secretKey;
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if (secureHash === signed) {
      //kiểm tra checksum
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus == "0") {
            //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
            if (rspCode == "00") {
              //thanh cong
              //paymentStatus = '1'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
              // TODO:
              await orderModel.update("id", orderId, {payment_status: 2 });
              res.status(200).json({
                RspCode: "00",
                Message: "Thanh toán thành công",
                success: true,
              });
            } else {
              //that bai
              //paymentStatus = '2'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
              res.status(400).json({
                RspCode: "00",
                Message: "Thanh toán thành thất bại",
                success: false,
              });
            }
          } else {
            res.status(400).json({
              RspCode: "02",
              Message: "This order has been updated to the payment status",
              success: false,
            });
          }
        } else {
          res
            .status(400)
            .json({ RspCode: "04", Message: "Amount invalid", success: false });
        }
      } else {
        res
          .status(400)
          .json({ RspCode: "01", Message: "Order not found", success: false });
      }
    } else {
      res
        .status(400)
        .json({ RspCode: "97", Message: "Checksum failed", success: false });
    }
  } catch (error) {
    res.status(400).json({ Message: "Server error", success: false });
  }
}
