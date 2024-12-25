import * as yup from 'yup';

export const SignInSchema = yup.object({
   username: yup.string().required('Tài khoản không được để trống').max(100, '').default('huatan27'),
   password: yup.string().required('Mật khẩu không được để trống').max(100, '').default('123456789'),
});

export type SignInPropType = yup.InferType<typeof SignInSchema>;
