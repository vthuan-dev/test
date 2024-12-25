/* eslint-disable @typescript-eslint/naming-convention */
interface Cart {
   cartRoom: Array<CartRoom>;
   cartProduct: Array<CartProduct>;
}

interface CartRoom {
   capacity: number;
   created_at: Date;
   description: string;
   cart_id: number;
   id: number;
   image_url: string;
   position: string;
   product_id: number | null;
   quantity: number | null;
   room_id: number | null;
   room_name: string;
   status: null;
   type: number;
   user_id: number;
   price: string;
}
interface CartProduct {
   cart_id: number;
   category_id: number;
   created_at: string;
   description: null;
   id: number;
   image_url: string;
   price: string;
   product_id: number;
   product_name: string;
   quantity: number;
   room_id: number | null;
   type: number;
   user_id: number;
}
