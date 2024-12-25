/* eslint-disable @typescript-eslint/naming-convention */
interface ResponseGetList<T> {
   isSuccess: boolean;
   message: string;
   data: Array<T>;
   pagination: {
      currentPage: number;
      limit: number;
      totalPage: number;
      totalRecord: number;
   };
}

interface ResponseGet<T> {
   isSuccess: boolean;
   message: string;
   data: T;
}

interface Categories {
   id: number;
   category_name: string;
   description: string;
   created_at: Date;
}

interface Product {
   id: number;
   category_id: number;
   product_name: string;
   created_at: Date;
   description: string;
   image_url: string;
   price: string;
}
