/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { storage } from '~/utils/firebase';

const firebaseUploadImage = async (data: any) => {
   if (data) {
      try {
         const imageUpload = data.target.files[0];
         const storageRef = ref(storage, `files/${imageUpload.name}` + v4());

         const snapshot = await uploadBytes(storageRef, imageUpload);
         const image = await getDownloadURL(snapshot.ref);
         return image;
      } catch (error) {
         // setToastMessage('Đã có lỗi xảy ra!', 'error');
         console.log(error);
      }
   } else {
      // setToastMessage('Đã có lỗi xảy ra!', 'error');
   }
};

export default firebaseUploadImage;
