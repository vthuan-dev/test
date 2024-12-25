/* eslint-disable @typescript-eslint/no-explicit-any */

type AxiosResponseData<TData = Record<string, any>> = {
   success: boolean;
   message: string;
   data: TData;
};
