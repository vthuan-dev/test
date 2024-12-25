import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSearchParamsHook } from '@hooks';
import { API_ROUTE } from '@constants';
import { getRequest } from '~/app/configs';

function SaveOnlinePayment() {
  const params = useSearchParamsHook();
  const navigate = useNavigate();
  console.log(params);

  const vnp_ResponseCode = params.searchParams.vnp_ResponseCode;

  // Kiểm tra xem vnp_ResponseCode có phải là '00' không, nếu không thì không gọi API
  if (vnp_ResponseCode !== '00') {
    toast.error('Thanh toán thất bại');
    navigate('/cart'); // Chuyển hướng về giỏ hàng
    return <></>; // Dừng việc thực thi component
  }

  // Cấu hình gọi API
  const config = {
    params: {
      vnp_Amount: params.searchParams.vnp_Amount,
      vnp_BankCode: params.searchParams.vnp_BankCode,
      vnp_BankTranNo: params.searchParams.vnp_BankTranNo || '',
      vnp_CardType: params.searchParams.vnp_CardType,
      vnp_OrderInfo: params.searchParams.vnp_OrderInfo,
      vnp_PayDate: params.searchParams.vnp_PayDate,
      vnp_ResponseCode: params.searchParams.vnp_ResponseCode,
      vnp_TmnCode: params.searchParams.vnp_TmnCode,
      vnp_TransactionNo: params.searchParams.vnp_TransactionNo,
      vnp_TransactionStatus: params.searchParams.vnp_TransactionStatus,
      vnp_TxnRef: params.searchParams.vnp_TxnRef,
      vnp_SecureHash: params.searchParams.vnp_SecureHash,
    },
  };

  useQuery({
    queryKey: [API_ROUTE.SAVE_PAYMENT],
    queryFn: () => getRequest(API_ROUTE.SAVE_PAYMENT, config),
    onSuccess: (res) => {
      if (res.RspCode === '00') {
        // Thành công
        toast.success('Thanh toán thành công!');
        navigate('/cart'); // Chuyển hướng đến giỏ hàng
      }
    },
    onError: (err) => {
      toast.error(`Lỗi khi thanh toán: ${err?.message || 'Có lỗi xảy ra!'}`);
      navigate('/cart'); // Chuyển hướng về giỏ hàng
    },
  });

  return <></>;
}

export default SaveOnlinePayment;
