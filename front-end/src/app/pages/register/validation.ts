import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
   email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
   username: Yup.string().required('Tài khoản là bắt buộc'),
   password: Yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
   passwordComfirm: Yup.string()
      .oneOf([Yup.ref('password')], 'Mật khẩu không khớp') // Loại bỏ `null`
      .required('Bạn cần nhập lại mật khẩu'),
});

export type ValidationType = Yup.InferType<typeof validationSchema>;
