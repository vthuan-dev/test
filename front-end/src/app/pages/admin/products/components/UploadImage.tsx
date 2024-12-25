/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, styled } from '@mui/material';
import React, { useEffect } from 'react';
import { useController, type Control, type FieldValues, type UseFormGetValues } from 'react-hook-form';

import noImage from '@assets/images/no-image.png';

interface UploadImagePropType<TFieldValues extends FieldValues = FieldValues> {
   control: Control<TFieldValues>;
   name: string;
   file: React.ChangeEvent<HTMLInputElement> | null;
   handleClose: () => void;
   setFile: React.Dispatch<React.SetStateAction<React.ChangeEvent<HTMLInputElement> | null>>;
   getValues: UseFormGetValues<any>;
   itemId?: number;
   isSubmitted: boolean; // Thêm prop để theo dõi trạng thái submit
   imageUrl: string | null;
   setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
   setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadImage = (props: UploadImagePropType) => {
   const { control, name, file, setFile, getValues, itemId, isSubmitted, imageUrl, setImageUrl, setIsSubmitted } =
      props; // Nhận prop isSubmitted

   const {
      field: { value: imageOrImages },
      fieldState: { error },
   } = useController({ name, control });

   const handleChangeInputFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      setFile(event);
   };

   useEffect(() => {
      if (file) {
         const fileImage = file?.target.files;
         if (fileImage && fileImage.length > 0) {
            const newFile = fileImage[0];
            const reader = new FileReader();

            reader.onload = () => {
               setImageUrl(reader.result as string); // Lưu trữ chuỗi base64 khi file được đọc
            };

            reader.readAsDataURL(newFile);
            setIsSubmitted(false);
            return () => {
               // Dọn dẹp bất kỳ object URL nào nếu được tạo
               URL.revokeObjectURL(imageUrl || '');
            };
         }

         return setImageUrl(null);
      } else {
         setImageUrl(imageOrImages.length > 0 ? imageOrImages : null); // Đặt lại hình ảnh thành hình ảnh dự phòng
      }
   }, [file, imageOrImages]);

   return (
      <Box>
         <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Button
               component="label"
               htmlFor="upload-image"
               variant="contained"
               tabIndex={-1}
               sx={{
                  position: 'relative',
                  zIndex: 2,
                  cursor: 'pointer',
                  width: 150,
                  height: 150,
                  background: 'center center/cover no-repeat',
                  backgroundImage: `url('${imageUrl ?? noImage}')`,
               }}
            >
               <VisuallyHiddenInput id="upload-image" type="file" onChange={handleChangeInputFile} />
            </Button>
         </Box>

         {/* Chỉ hiển thị thông báo lỗi khi người dùng đã nhấn submit */}
         <Box sx={{ fontSize: '0.75rem', color: '#d32f2f' }}>
            {isSubmitted &&
               (error?.message || file === null || (!itemId && getValues('image_url') === '')) &&
               'Hình ảnh không được để trống!!!'}
         </Box>
      </Box>
   );
};

const VisuallyHiddenInput = styled('input')({
   clip: 'rect(0 0 0 0)',
   clipPath: 'inset(50%)',
   height: 1,
   overflow: 'hidden',
   position: 'absolute',
   bottom: 0,
   left: 0,
   whiteSpace: 'nowrap',
   width: 1,
});

export default UploadImage;
