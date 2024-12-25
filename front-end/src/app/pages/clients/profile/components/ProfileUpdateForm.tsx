/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/naming-convention */
import { useForm } from 'react-hook-form';
import { Box, Button, Grid, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuth from '~/app/redux/slices/auth.slice';
import { putRequest } from '~/app/configs';

interface User {
   username: string;
   phone: string;
   email: string;
}

const ProfileUpdateForm = (props: {
   setSelectedView: Dispatch<SetStateAction<'overview' | 'editProfile' | 'changePassword' | 'cart'>>;
}) => {
   const { user } = useAuth();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [openSnackbar, setOpenSnackbar] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState('');
   const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<User>({
      defaultValues: {
         username: user?.username || '',
         phone: user?.phone || '',
         email: user?.email || '',
      },
   });

   const { mutate } = useMutation({
      mutationFn: (data: User) => putRequest(`/auth/update-user-info/${user?.id}`, data),
      onSuccess: () => {
         setSnackbarMessage('Cập nhật hồ sơ thành công!');
         setSnackbarSeverity('success');
         setIsSubmitting(false);
         props.setSelectedView('overview');
         toast.success('Cập nhật thành công');
      },
      onError: () => {
         setSnackbarMessage('Có lỗi xảy ra, vui lòng thử lại.');
         setSnackbarSeverity('error');
         setIsSubmitting(false);
         toast.error('Đã có lỗi xảy ra');
      },
   });

   const onSubmit = async (data: User) => {
      setIsSubmitting(true);
      mutate(data);
   };

   const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
   };

   return (
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
         <Typography variant="h5" mb={2}>
            Cập nhật hồ sơ
         </Typography>
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <TextField
                  label="Tên Tài Khoản"
                  fullWidth
                  {...register('username', { required: 'Tên tài khoản là bắt buộc' })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
               />
            </Grid>
            <Grid item xs={12}>
               <TextField
                  label="Số Điện Thoại"
                  fullWidth
                  {...register('phone', {
                     required: 'Số điện thoại là bắt buộc',
                     pattern: {
                        value: /^[0-9]{10,11}$/,
                        message: 'Số điện thoại không hợp lệ',
                     },
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
               />
            </Grid>
            <Grid item xs={12}>
               <TextField
                  label="Email"
                  fullWidth
                  {...register('email', {
                     required: 'Email là bắt buộc',
                     pattern: {
                        value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                        message: 'Email không hợp lệ',
                     },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
               />
            </Grid>
            <Grid item xs={12}>
               <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
               </Button>
            </Grid>
         </Grid>

         <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
               {snackbarMessage}
            </Alert>
         </Snackbar>
      </Box>
   );
};

export default ProfileUpdateForm;
