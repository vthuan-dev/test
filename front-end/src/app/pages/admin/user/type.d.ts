/* eslint-disable @typescript-eslint/naming-convention */

interface UserData {
   id: number; // User ID
   username: string; // Username
   password: string; // Password (should be handled securely)
   email: string; // Email address
   user_type: 1 | 2; // User type
   is_vip: 1 | 2; // VIP status
   vip_start_date: Date | null; // VIP start date
   vip_end_date: Date | null; // VIP end date
   created_at: Date; // Account creation date
}

interface OrderDetail {
   id: number; // ID of the order detail
   product_id: number; // Product ID
   product_name: string; // Name of the product
   product_image: string; // URL of the product image
   quantity: number; // Quantity of the product
   price: number; // Price of the product
}

interface RoomOrderDetail {
   id: number; // ID of the room order detail
   room_id: number; // Room ID
   start_time: string; // Start time of the booking
   end_time: string; // End time of the booking
   room_image: string; // End time of the booking
   total_time: number; // Total time booked
   total_price: number; // Total price for the room booking
}

interface OrderData {
   id: number; // Order ID
   total_money: number; // Total money for the order
   order_date: string; // Order date
   order_status: string; // Status of the order
   order_details: OrderDetail[]; // List of order details
   room_order_details: RoomOrderDetail[]; // List of room order details
}

interface UserOrdersResponse {
   user: UserData; // User details
   orders: OrderData[]; // List of orders for the user
}
