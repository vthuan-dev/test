/* eslint-disable no-console */

export const useLocalStorage = () => {
   const getLocalStorage = (key: string) => {
      try {
         const value: string | null = localStorage.getItem(key);
         return value ? (JSON.parse(value) as string | Record<string, unknown>) : value;
      } catch (_) {
         console.error('đã có lỗi xảy ra');
      }
   };

   const setLocalStorage = <T>(key: string, data: T) => {
      try {
         if (import.meta.env.VITE_AUTH_TOKEN === key) {
            return localStorage.setItem(key, data as string);
         }
         return localStorage.setItem(key, JSON.stringify(data));
      } catch (_) {
         console.error('đã có lỗi xảy ra');
      }
   };

   return { getLocalStorage, setLocalStorage };
};
