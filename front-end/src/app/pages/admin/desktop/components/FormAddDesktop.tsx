/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-misused-promises */
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Modal, Stack, Typography } from '@mui/material';
import React, { type Dispatch, type SetStateAction } from 'react';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { CreateDesktopSchema, type CreateDesktopType } from '../validation';
import { apiPostDesktop, getRoomByCountDesktop } from '../service';

import TableDescription from './TableDescription';

import { ControllerLabel, ControllerSelect, ControllerTextField } from '@components/formController';

interface FormAddProductPropType {
   open: boolean;
   setOpen: Dispatch<SetStateAction<boolean>>;
   productId?: number;
   setProductId: Dispatch<SetStateAction<number | undefined>>;
   totalDesktop: number;
}

const FormAddDesktop = (props: FormAddProductPropType) => {
   const { open, setOpen, setProductId, productId, totalDesktop } = props;

   const { control, reset, handleSubmit } = useForm<CreateDesktopType>({
      resolver: yupResolver(CreateDesktopSchema),
      defaultValues: {
         ...CreateDesktopSchema.getDefault(),
         desktop_name: `Máy ${totalDesktop + 1}`,
      },
   });

   const { data: rooms } = getRoomByCountDesktop();

   const handleClose = () => {
      reset();
      setOpen(false);
      setProductId(undefined);
   };
   const { mutate } = apiPostDesktop({ handleClose });

   const onSubmitForm: SubmitHandler<CreateDesktopType> = (data) => {
      mutate({
         ...data,
         description: JSON.stringify(data.description),
      });
   };

   return (
      <React.Fragment>
         <Modal
            open={open}
            // onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
         >
            <Box sx={style}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  Thêm Thiết bị
               </Typography>
               <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmitForm)}
                  display="flex"
                  flexDirection="column"
                  gap="12px"
                  mt={2}
               >
                  <Box display="flex" gap={2}>
                     <Box flex={1}>
                        <ControllerLabel title="Tên máy/STT" required />
                        <ControllerTextField
                           name="desktop_name"
                           control={control as never}
                           placeholder="Nhập Tên Máy/STT"
                        />
                     </Box>
                     <Stack flexDirection="row" flex={2} gap={2}>
                        <Box flex={1}>
                           <ControllerLabel title="Phòng" required />
                           <ControllerSelect<FieldValues, RoomByCountDesktop>
                              name="room_id"
                              control={control as never}
                              options={rooms?.data ?? []}
                              valuePath="id"
                              titlePath="room_name"
                              placeholder="Chọn phòng"
                              disabledMenuItem={(item: RoomByCountDesktop) => item.capacity === item.desktop_count}
                           />
                        </Box>
                        <Box flex={1}>
                           <ControllerLabel title="Giá thuê/1h" required />
                           <ControllerTextField
                              name="price"
                              control={control as never}
                              placeholder="Nhập giá thuê"
                              number
                           />
                        </Box>
                     </Stack>
                  </Box>

                  <Box sx={{ height: '394px', overflowY: 'scroll' }}>
                     <ControllerLabel title="Mô tả" />
                     <TableDescription control={control} />
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="end" gap={2} mt={2}>
                     <Button type="button" color="error" variant="outlined" onClick={handleClose}>
                        Hủy
                     </Button>
                     <LoadingButton type="submit" variant="outlined" loading={false}>
                        {productId ? 'Cập nhật' : 'Thêm mới'}
                     </LoadingButton>
                  </Box>
               </Box>
            </Box>
         </Modal>
      </React.Fragment>
   );
};

const style = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   minWidth: 600,
   height: '90vh',
   bgcolor: 'background.paper',
   borderRadius: '10px',
   boxShadow: 24,
   padding: 2,
};

export default FormAddDesktop;
