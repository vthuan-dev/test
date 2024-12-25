import moment from "moment";

export const getBillNotify = (bill) => {
  return {
    to: bill.email,
    subject: "Hủy đơn hàng.",
    html: /* html */ `
       <h4>Thân gửi ${bill.username}</h4>
       <div>
         Đơn hàng bị hủy ngày ${moment().format("DD/MM/YYYY")}.
        
         <p>Cảm ơn bạn đã tin tưởng và ủng hộ.</p>
         
         <hr style="width: 100%; height: 0.5px; background: #d1d5db">
         <i>Lưu ý: Đây là mail tự động, vui lòng không trả lời mail này.</i>
         <br>
         <b>Trân trọng!</b>
         <br>
         <i>Web quản lý phòng game.</i>
       </div>
      `,
  };
};

export const getOrderSuccessNotify = (bill) => {
  return {
    to: bill.email,
    subject: "Đặt hàng thành công.",
    html: /* html */ `
       <h4>Thân gửi ${bill.username}</h4>
       <div>
         Đơn hàng của bạn đã được đặt thành công ngày ${moment().format("DD/MM/YYYY")}!
         
         <p>Mã đơn hàng: <b>${bill.order_id}</b></p>
         <p>Tổng tiền: <b>${bill.total.toLocaleString()} VND</b></p>
         
         <p>Cảm ơn bạn đã tin tưởng và ủng hộ.</p>
         
         <hr style="width: 100%; height: 0.5px; background: #d1d5db">
         <i>Lưu ý: Đây là mail tự động, vui lòng không trả lời mail này.</i>
         <br>
         <b>Trân trọng!</b>
         <br>
         <i>Web quản lý phòng game.</i>
       </div>
      `,
  };
};
