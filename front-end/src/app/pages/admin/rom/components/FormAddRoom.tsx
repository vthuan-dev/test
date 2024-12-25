/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/naming-convention */
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import UploadImage from '../../products/components/UploadImage';
import { RoomCreateSchema, type RoomCreateType } from '../validation';
import { apiDeleteImageFirebase, apiGetRoomDetail, apiUpdateRoom, apiUploadImageFirebase, postRoom } from '../service';

import TableDescription from './TableRoom';

import { ControllerLabel, ControllerTextField } from '@components/formController';
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

interface FormAddRomPropType {
   open: boolean;
   setOpen: Dispatch<SetStateAction<boolean>>;
   roomId?: number;
   setRoomId: Dispatch<SetStateAction<number | undefined>>;
}

const FormAddRoom = (props: FormAddRomPropType) => {
   const { open, setOpen, roomId, setRoomId } = props;

   const [isSubmitted, setIsSubmitted] = useState(false);

   const [imageUrl, setImageUrl] = useState<string | null>(null);

   const { control, reset, handleSubmit, getValues, watch } = useForm<RoomCreateType>({
      resolver: yupResolver(RoomCreateSchema),
      defaultValues: RoomCreateSchema.getDefault(),
   });

   const [file, setFile] = useState<React.ChangeEvent<HTMLInputElement> | null>(null);

   const handleClose = () => {
      reset(RoomCreateSchema.getDefault());
      setOpen(false);
      setRoomId(undefined);
      setImageUrl(null);
   };

   const { uploadFirebaseImage, deleteFirebaseImage } = useFirebaseUpload();

   const { mutate } = postRoom({ handleClose });
   const { mutate: updateRoom } = apiUpdateRoom({ roomId, setOpen });
   apiGetRoomDetail({ roomId, reset });

   const dataForm = (values: RoomCreateType) => {
      return {
         ...Object.fromEntries(
            Object.entries(values).filter(([key]) => !key.startsWith('room_') || key === 'room_name'),
         ),
         position: values.position ? values.position : '', // Default to empty string
         price: String(values.price), // Convert to string
         description: JSON.stringify(values.description), // Convert to JSON string
         id: roomId,
      };
   };

   const { mutate: callbackDeleteImage } = apiDeleteImageFirebase({ deleteFirebaseImage });
   const { mutate: callbackUploadImage, isLoading: uploadLoading } = apiUploadImageFirebase({
      uploadFirebaseImage,
      dataForm: dataForm(watch()),
      callbackDeleteImage,
      createRoom: mutate,
      roomId: roomId,
      updateRoom: updateRoom,
   });

   const onSubmitForm: SubmitHandler<RoomCreateType> = () => {
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
            aria-labelledby="modal-modal-title"
            // onClose={handleClose}
            aria-describedby="modal-modal-description"
         >
            <Box sx={style}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  {roomId ? 'Cập nhật phòng' : 'Thêm mới phòng'}
               </Typography>
               <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmitForm)}
                  display="flex"
                  flexDirection="column"
                  gap="12px"
                  mt={2}
               >
                  <Box display={'flex'} gap={2}>
                     <Box>
                        <Box display="flex" gap={2} flex={5}>
                           <Box flex={1}>
                              <ControllerLabel title="Tên phòng" required />
                              <ControllerTextField name="room_name" control={control} placeholder="Nhập tên phòng" />
                           </Box>
                           <Box flex={1}>
                              <ControllerLabel title="Số lượng máy" required />
                              <ControllerTextField
                                 name="capacity"
                                 control={control as never}
                                 number
                                 placeholder="Nhập số lượng"
                              />
                           </Box>
                        </Box>
                        <Box display="flex" gap={2}>
                           <Box flex={1}>
                              <ControllerLabel title="Giá / 1 giờ" required />
                              <ControllerTextField
                                 name="price"
                                 control={control as never}
                                 number
                                 placeholder="Nhập số lượng"
                              />
                           </Box>
                           <Box flex={1}>
                              <ControllerLabel title="Vị trí" />
                              <ControllerTextField
                                 name="position"
                                 control={control as never}
                                 placeholder="Nhập vị trí phòng"
                              />
                           </Box>
                        </Box>
                     </Box>
                     <Box flex={1} display="flex" alignItems="end" justifyContent="center">
                        <UploadImage
                           name="image_url"
                           control={control as never}
                           handleClose={handleClose}
                           file={file}
                           setFile={setFile}
                           getValues={getValues}
                           itemId={roomId}
                           isSubmitted={isSubmitted} // Pass isSubmitted state
                           imageUrl={imageUrl}
                           setImageUrl={setImageUrl}
                           setIsSubmitted={setIsSubmitted}
                        />
                     </Box>
                  </Box>
                  <Box>
                     <ControllerLabel title="Mô tả" />
                     <TableDescription control={control} />
                  </Box>

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
                        {roomId ? 'Cập nhật' : 'Thêm mới'}
                     </LoadingButton>
                  </Box>
               </Box>
            </Box>
         </Modal>
      </React.Fragment>
   );
};

export default FormAddRoom;
