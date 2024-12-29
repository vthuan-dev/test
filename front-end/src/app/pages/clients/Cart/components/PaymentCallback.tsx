import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PaymentCallback = () => {
   const navigate = useNavigate();

   useEffect(() => {
      const handlePaymentResult = async () => {
         try {
            // Lấy thông tin từ URL callback
            const urlParams = new URLSearchParams(window.location.search);
            const responseCode = urlParams.get('vnp_ResponseCode');
            const orderId = urlParams.get('vnp_TxnRef');

            // Gọi API xác thực thanh toán và cập nhật trạng thái đơn hàng
            const response = await fetch(
               `${process.env.REACT_APP_API_URL}/order/payment/callback/vnpay_return${window.location.search}`
            );
            const data = await response.json();

            if (responseCode === '00' && data.success) {
               // Cập nhật trạng thái đơn hàng thành đã xác nhận
               await fetch(`${process.env.REACT_APP_API_URL}/order/update/${orderId}`, {
                  method: 'PUT',
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                     status: 'CONFIRMED',
                     payment_status: 'PAID'
                  })
               });

               toast.success('Thanh toán thành công!');
               navigate('/orders');
            } else {
               toast.error('Thanh toán thất bại!');
               navigate('/cart');
            }
         } catch (error) {
            console.error('Lỗi callback thanh toán:', error);
            toast.error('Có lỗi xảy ra khi xử lý thanh toán');
            navigate('/cart');
         }
      };

      handlePaymentResult();
   }, [navigate]);

   return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
         <h2>Đang xử lý kết quả thanh toán...</h2>
      </div>
   );
};

export default PaymentCallback; 