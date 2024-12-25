/* eslint-disable @typescript-eslint/no-misused-promises */
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { postRequest } from '~/app/configs';
import useAuth from '~/app/redux/slices/auth.slice';

interface ChangePasswordFormInputs {
   currentPassword: string;
   newPassword: string;
   confirmPassword: string;
}

// Yup validation schema
const schema = yup.object({
   currentPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
   newPassword: yup
      .string()
      .required('Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .matches(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa')
      .matches(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ cái thường')
      .matches(/\d/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
   confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
      .required('Vui lòng xác nhận mật khẩu mới'),
});

const ChangePasswordForm = () => {
   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<ChangePasswordFormInputs>({
      resolver: yupResolver(schema),
   });

   const { mutate } = useMutation({
      mutationFn: (data) => postRequest('/auth/change-password', data),
      onSuccess: () => {
         toast.success('Cập nhật thành công.');
      },
      onError: () => {
         toast.error('Đã có lỗi xảy ra.');
      },
   });
   const {user} = useAuth();
   const onSubmit: SubmitHandler<ChangePasswordFormInputs> = (data) => {
      const extendedData = { ...data, id: user?.id }; // Thêm id của user
      mutate(extendedData as never);
   };
   

   return (
      <>
         <Typography variant="h6" gutterBottom>
            Thay đổi mật khẩu
         </Typography>
         <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
               {/* Current Password */}
               <Grid item xs={12}>
                  <TextField
                     label="Mật khẩu hiện tại"
                     type="password"
                     fullWidth
                     {...register('currentPassword')}
                     error={!!errors.currentPassword}
                     helperText={errors.currentPassword?.message}
                  />
               </Grid>

               {/* New Password */}
               <Grid item xs={12}>
                  <TextField
                     label="Mật khẩu mới"
                     type="password"
                     fullWidth
                     {...register('newPassword')}
                     error={!!errors.newPassword}
                     helperText={errors.newPassword?.message}
                  />
               </Grid>

               {/* Confirm New Password */}
               <Grid item xs={12}>
                  <TextField
                     label="Xác nhận mật khẩu mới"
                     type="password"
                     fullWidth
                     {...register('confirmPassword')}
                     error={!!errors.confirmPassword}
                     helperText={errors.confirmPassword?.message}
                  />
               </Grid>
            </Grid>

            <Box mt={2} display="flex" justifyContent="flex-end">
               <Button type="submit" variant="contained" color="primary">
                  Cập nhật mật khẩu
               </Button>
            </Box>
         </Box>
      </>
   );
};

export default ChangePasswordForm;
