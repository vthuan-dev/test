/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { type Dispatch, type SetStateAction } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import type { QueryObserverResult } from '@tanstack/react-query';

import { CreateCategorySchema, type CreateCategoryType } from '../validation';
import { apiPostCategory } from '../service';

import { ControllerLabel, ControllerTextarea, ControllerTextField } from '@components/formController';

const style = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   minWidth: 600,
   bgcolor: 'background.paper',
   borderRadius: '10px',
   boxShadow: 24,
   padding: 2,
};

interface FormAddCategoryPropType {
   open: boolean;
   setOpen: Dispatch<SetStateAction<boolean>>;
   refetchCatrgory: () => Promise<QueryObserverResult<ResponseGetList<Categories>, unknown>>;
}

const FormAddCategory = (props: FormAddCategoryPropType) => {
   const { open, setOpen, refetchCatrgory } = props;

   const { control, reset, handleSubmit } = useForm<CreateCategoryType>({
      resolver: yupResolver(CreateCategorySchema),
      defaultValues: CreateCategorySchema.getDefault(),
   });

   const handleClose = () => {
      reset();
      setOpen(false);
   };

   const { mutate } = apiPostCategory({ handleClose, refetchCatrgory });

   const onSubmitForm: SubmitHandler<CreateCategoryType> = (data) => mutate(data);

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
                  Thêm mới danh mục sản phẩm
               </Typography>
               <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmitForm)}
                  display="flex"
                  flexDirection="column"
                  gap="12px"
                  mt={2}
               >
                  <Box>
                     <ControllerLabel title="Tên danh mục" required />
                     <ControllerTextField name="category_name" control={control} placeholder="Nhập tên sản phẩm" />
                  </Box>
                  <Box>
                     <ControllerLabel title="Mô tả" />
                     <ControllerTextarea
                        name="description"
                        control={control as never}
                        placeholder="Nhập mô tả ngắn sản phẩm"
                     />
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="end" gap={2} mt={2}>
                     <Button type="button" color="error" variant="outlined" onClick={handleClose}>
                        Hủy
                     </Button>
                     <LoadingButton type="submit" variant="outlined" loading={false}>
                        Thêm mới
                     </LoadingButton>
                  </Box>
               </Box>
            </Box>
         </Modal>
      </React.Fragment>
   );
};

export default FormAddCategory;
