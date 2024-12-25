/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';

import { CreateProductSchema, type CreateProductType } from '../validation';
import {
   apiCreateProduct,
   apiDeleteImageFirebase,
   apiGetProductDetail,
   apiUpdateProduct,
   apiUploadImageFirebase,
} from '../service';

import UploadImage from './UploadImage';

import { ControllerLabel, ControllerSelect, ControllerTextarea, ControllerTextField } from '@components/formController';
import useFirebaseUpload from '@hooks/useFirebaseUpload';

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

interface FormAddProductPropType {
   open: boolean;
   setOpen: Dispatch<SetStateAction<boolean>>;
   productId?: number;
   setProductId: Dispatch<SetStateAction<number | undefined>>;
   refetchListProduct: <TPageData>(
      options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
   ) => Promise<QueryObserverResult<ResponseGetList<Product>, unknown>>;
   categories: Categories[] | undefined;
}

const FormAddProduct = (props: FormAddProductPropType) => {
   const { open, setOpen, productId, setProductId, refetchListProduct, categories } = props;

   const [isSubmitted, setIsSubmitted] = useState(false);

   const [imageUrl, setImageUrl] = useState<string | null>(null);

   const [file, setFile] = useState<React.ChangeEvent<HTMLInputElement> | null>(null);

   const { control, reset, handleSubmit, getValues } = useForm<CreateProductType>({
      resolver: yupResolver(CreateProductSchema),
      defaultValues: CreateProductSchema.getDefault(),
   });

   apiGetProductDetail(productId, reset);

   const handleClose = () => {
      reset();
      setOpen(false);
      setProductId(undefined);
   };

   const { uploadFirebaseImage, deleteFirebaseImage } = useFirebaseUpload();

   const { mutate: createProduct } = apiCreateProduct({ deleteFirebaseImage, setOpen, refetchListProduct });
   const { mutate: updateProduct } = apiUpdateProduct({ setOpen, refetchListProduct });

   const { mutate: callbackDeleteImage } = apiDeleteImageFirebase({ deleteFirebaseImage });
   const { mutate: callbackUploadImage, isLoading: uploadLoading } = apiUploadImageFirebase({
      uploadFirebaseImage,
      productId,
      createProduct,
      dataForm: getValues(),
      callbackDeleteImage,
      updateProduct,
   });

   const onSubmitForm: SubmitHandler<CreateProductType> = () => {
      if (!imageUrl) {
         setIsSubmitted(true);
      } else {
         callbackUploadImage(file);
      }
   };

   return (
      <React.Fragment>
         <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
         >
            <Box sx={style}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  Thêm mới sản phẩm
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
                        <ControllerLabel title="Tên sản phẩm" required />
                        <ControllerTextField name="product_name" control={control} placeholder="Nhập tên sản phẩm" />
                     </Box>
                     <Box flex={1}>
                        <ControllerLabel title="Danh mục sản phẩm" required />
                        <ControllerSelect
                           name="category_id"
                           control={control as never}
                           options={categories ?? []}
                           valuePath="id"
                           titlePath="category_name"
                           placeholder="Chọn danh mục sản phảm"
                        />
                     </Box>
                  </Box>
                  <Box>
                     <ControllerLabel title="Giá bán" required />
                     <ControllerTextField
                        name="price"
                        control={control as never}
                        placeholder="Nhập giá bán sản phẩm"
                        number
                     />
                  </Box>
                  <Box>
                     <ControllerLabel title="Mô tả" />
                     <ControllerTextarea
                        name="description"
                        control={control as never}
                        placeholder="Nhập mô tả ngắn sản phẩm"
                     />
                  </Box>
                  <UploadImage
                     name="image_url"
                     control={control as never}
                     handleClose={handleClose}
                     file={file}
                     setFile={setFile}
                     getValues={getValues}
                     itemId={productId}
                     imageUrl={imageUrl}
                     isSubmitted={isSubmitted}
                     setImageUrl={setImageUrl}
                     setIsSubmitted={setIsSubmitted}
                  />
                  <Box display="flex" alignItems="center" justifyContent="end" gap={2} mt={2}>
                     <Button
                        type="button"
                        color="error"
                        variant="outlined"
                        disabled={uploadLoading}
                        onClick={handleClose}
                     >
                        Hủy
                     </Button>
                     <LoadingButton type="submit" variant="outlined" loading={uploadLoading}>
                        {productId ? 'Cập nhật' : 'Thêm mới'}
                     </LoadingButton>
                  </Box>
               </Box>
            </Box>
         </Modal>
      </React.Fragment>
   );
};

export default FormAddProduct;
