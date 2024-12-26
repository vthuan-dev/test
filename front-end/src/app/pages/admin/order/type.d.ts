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

// Định nghĩa interface cho Room trong order
interface OrderRoom {
   id: number;               // ID của room_order_detail
   room_id: number;          // ID của room
   room_name: string;
   start_time: string;
   end_time: string;
   total_time: number;
   total_price: number;
   status?: string;
}

// Định nghĩa interface cho Order
interface OrderResponse {
   order_id: number;
   order_date: string;
   order_status: string;
   total_amount: number;
   user: User;
   rooms: OrderRoom[];      // Sử dụng OrderRoom[] thay vì Room[]
   products: Product[];
}

// Định nghĩa interface cho request đổi phòng
interface ChangeRoomRequest {
   orderId: number;
   orderDetailId: number;    // ID của room_order_detail
   oldRoomId: number;       // ID của room cũ
   newRoomId: number;       // ID của room mới
   startTime: string;
   endTime: string;
}

// Định nghĩa interface cho response của available rooms
interface AvailableRoom {
   id: number;              // ID của room_order_detail
   room_id: number;         // ID của room
   room_name: string;
   price: number;
   start_time: string | null;
   end_time: string | null;
   order_id?: number;
   total_price?: number;
   status: string;
   originalStatus?: string;
}
