import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';

import { storage } from '~/utils/firebase';

function useFirebaseUpload() {
   // Type for 'data' will be React.ChangeEvent<HTMLInputElement> | null
   const uploadFirebaseImage = async (
      data: React.ChangeEvent<HTMLInputElement> | null,
   ): Promise<string | string[] | undefined> => {
      if (data && data.target.files) {
         try {
            if (data.target.files.length >= 2) {
               const images = Array.from(data.target.files); // Convert FileList to an array

               const uploadPromises = images.map(async (fileImage) => {
                  const storageRef = ref(storage, fileImage.name + Math.floor(Math.random() * 100000000000000));
                  const snapshot = await uploadBytes(storageRef, fileImage);
                  return getDownloadURL(snapshot.ref); // Returns a URL for each uploaded image
               });

               const uploadedUrls = await Promise.all(uploadPromises);

               return uploadedUrls; // Return an array of URLs
            } else {
               const storageRef = ref(storage, data.target.files[0].name);
               const snapshot = await uploadBytes(storageRef, data.target.files[0]);
               const uploadedUrl = await getDownloadURL(snapshot.ref);

               return uploadedUrl; // Return the URL of the single uploaded image
            }
            // eslint-disable-next-line no-empty
         } catch (error) {
            console.log('lỗi: ', error);
         }
      }
   };

   const deleteFirebaseImage = async (srcImage: string | string[]): Promise<boolean> => {
      if (srcImage) {
         try {
            // Handle array of images
            if (Array.isArray(srcImage) && srcImage.length > 0) {
               const deletePromises = srcImage.map(async (image) => {
                  const desertRef = ref(storage, image); // 'image' is a string, so no error here
                  await deleteObject(desertRef);
               });

               await Promise.all(deletePromises);
               return true;
            }

            // Handle single image
            if (typeof srcImage === 'string') {
               const desertRef = ref(storage, srcImage); // Now 'srcImage' is guaranteed to be a string
               await deleteObject(desertRef);
               return true;
            }
         } catch (error) {
            return false;
         }
      }
      return false;
   };

   return { uploadFirebaseImage, deleteFirebaseImage };
}

export default useFirebaseUpload;
