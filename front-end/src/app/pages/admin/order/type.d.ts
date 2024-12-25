/* eslint-disable @typescript-eslint/naming-convention */

interface OrderItem {
   id: number;
   user_id: number;
   total_money: string;
   order_date: string | null;
   status: string;
   description: string;
   created_at: Date;
}

// Define an interface for the Product
interface Product {
   product_name: string;
   unit_price: number;
   quantity: number;
   total_price: number;
   category: string;
}

// Define an interface for the Room
interface Room {
   room_name: string;
   start_time: string; // or Date if you want to use Date object
   end_time: string; // or Date if you want to use Date object
   total_time: number; // in hours
   total_price: number;
}

// Define an interface for the User
interface User {
   phone: string;
   phone: string;
   username: string;
   email: string;
   is_vip: boolean;
   vip_end_date?: string; // Optional if VIP status might not be present
}

// Define an interface for the Order
interface OrderResponse {
   order_id: string; // or number depending on your database type
   order_date: string; // or Date if you want to use Date object
   order_status: string;
   total_amount: number;
   user: User;
   products: Product[];
   rooms: Room[];
}
