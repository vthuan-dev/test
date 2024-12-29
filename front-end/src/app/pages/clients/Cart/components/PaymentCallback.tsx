import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const PaymentCallback = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   useEffect(() => {
      const handlePaymentResult = async () => {
         try {
            const urlParams = new URLSearchParams(window.location.search);
            const responseCode = urlParams.get('vnp_ResponseCode');
            
            if (!responseCode) {
               throw new Error('Không nhận được mã phản hồi từ cổng thanh toán');
            }

            console.log('Payment callback params:', Object.fromEntries(urlParams));

            const response = await axios.get(
               `${process.env.REACT_APP_API_URL}/api/order/payment/callback/vnpay_return`,
               {
                  params: Object.fromEntries(urlParams),
                  withCredentials: true,
                  headers: {
                     'Content-Type': 'application/json',
                     'Accept': 'application/json'
                  }
               }
            );

            console.log('Payment callback response:', response.data);

            if (response.data.success) {
               await queryClient.invalidateQueries(['orders']);
               toast.success('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
               setTimeout(() => navigate('/orders'), 2000);
            } else {
               throw new Error(response.data.message || 'Thanh toán thất bại');
            }

         } catch (error) {
            console.error('Payment callback error:', error);
            toast.error(
               error?.response?.data?.message || 
               error.message || 
               'Có lỗi xảy ra trong quá trình xử lý thanh toán!'
            );
            setTimeout(() => navigate('/cart'), 2000);
         }
      };

      handlePaymentResult();
   }, [navigate, queryClient]);

   return (
      <div style={{ 
         textAlign: 'center', 
         marginTop: '50px',
         padding: '20px',
         backgroundColor: '#fff',
         borderRadius: '8px',
         boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
         <h2>Đang xử lý kết quả thanh toán...</h2>
         <p style={{ color: '#666' }}>Vui lòng không tắt hoặc làm mới trang.</p>
      </div>
   );
};

export default PaymentCallback; 