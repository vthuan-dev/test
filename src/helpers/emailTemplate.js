import moment from "moment";

export const getBillNotify = (bill) => {
  return {
    to: bill.email,
    subject: "Hủy đơn hàng",
    html: /* html */ `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
        <!-- Header -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #dc3545; margin: 0;">Thông Báo Hủy Đơn Hàng</h2>
        </div>

        <!-- Content -->
        <div style="padding: 30px; background: #fff; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0;">Xin chào ${bill.username},</h3>
          
          <p style="font-size: 16px; line-height: 1.5; color: #666;">
            Đơn hàng của bạn đã bị hủy vào ngày ${moment().format("DD/MM/YYYY")}.
          </p>

          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            Cảm ơn bạn đã tin tưởng và ủng hộ dịch vụ của chúng tôi.
          </p>

          <!-- Divider -->
          <div style="border-top: 2px solid #eee; margin: 30px 0;"></div>

          <!-- Footer -->
          <div style="font-size: 14px; color: #888; text-align: center;">
            <p style="margin: 5px 0;">
              <i>Lưu ý: Đây là email tự động, vui lòng không trả lời email này.</i>
            </p>
            <p style="font-weight: bold; margin: 15px 0;">Trân trọng!</p>
            <p style="color: #666;">
              <i>Web quản lý phòng game</i>
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

export const getOrderSuccessNotify = (bill) => {
  return {
    to: bill.email,
    subject: "Đặt hàng thành công",
    html: /* html */ `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
        <!-- Header -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #28a745; margin: 0;">Đặt Hàng Thành Công</h2>
        </div>

        <!-- Content -->
        <div style="padding: 30px; background: #fff; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0;">Xin chào ${bill.username},</h3>
          
          <p style="font-size: 16px; line-height: 1.5; color: #666;">
            Đơn hàng của bạn đã được đặt thành công vào ngày ${moment().format("DD/MM/YYYY")}!
          </p>

          <!-- Order Details -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;">
              <strong>Mã đơn hàng:</strong> 
              <span style="color: #007bff;">${bill.order_id}</span>
            </p>
            <p style="margin: 10px 0;">
              <strong>Tổng tiền:</strong> 
              <span style="color: #28a745; font-weight: bold;">
                ${bill.total.toLocaleString()} VND
              </span>
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            Cảm ơn bạn đã tin tưởng và ủng hộ dịch vụ của chúng tôi.
          </p>

          <!-- Divider -->
          <div style="border-top: 2px solid #eee; margin: 30px 0;"></div>

          <!-- Footer -->
          <div style="font-size: 14px; color: #888; text-align: center;">
            <p style="margin: 5px 0;">
              <i>Lưu ý: Đây là email tự động, vui lòng không trả lời email này.</i>
            </p>
            <p style="font-weight: bold; margin: 15px 0;">Trân trọng!</p>
            <p style="color: #666;">
              <i>Web quản lý phòng game</i>
            </p>
          </div>
        </div>
      </div>
    `,
  };
};
