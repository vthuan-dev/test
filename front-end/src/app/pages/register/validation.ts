import * as Yup from 'yup';

export type ValidationType = {
  email: string;
  username: string;
  password: string;
  passwordComfirm: string;
};

export const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  username: Yup.string()
    .required('Tài khoản là bắt buộc')
    .min(3, 'Tài khoản phải có ít nhất 3 ký tự'),
  password: Yup.string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  passwordComfirm: Yup.string()
    .required('Vui lòng nhập lại mật khẩu')
    .oneOf([Yup.ref('password')], 'Mật khẩu không khớp')
});

// Thêm getDefault function
validationSchema.getDefault = () => ({
  email: '',
  username: '',
  password: '',
  passwordComfirm: ''
});
