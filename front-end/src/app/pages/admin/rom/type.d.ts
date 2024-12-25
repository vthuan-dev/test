/* eslint-disable @typescript-eslint/naming-convention */
interface RoomItem {
   capacity: number;
   description: string;
   id: number;
   price: number;
   image_url: string;
   position: string;
   room_name: string;
   status: string;
   room?: string[];
}

interface UserItem {
   created_at: Date;
   email: string;
   id: number;
   is_vip: number;
   user_type: number;
   username: string;
   vip_end_date: null;
   vip_start_date: null;
}

interface Time {
   booking_times: string
}

interface RoomDetailItem {
   capacity: number;
   room_description: string;
   room_id: number;
   room_price: number;
   image_url: string;
   position: string;
   room_name: string;
   room_status: string;
   desktops: Array<{
      desktop_description: string;
      desktop_id: number;
      desktop_name: string;
      desktop_price: number;
      desktop_status: string;
   }>;
}
