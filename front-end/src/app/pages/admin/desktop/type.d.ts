/* eslint-disable @typescript-eslint/naming-convention */
interface Desktop {
   id: number;
   room_id: number;
   desktop_name: string;
   price: number;
   status: number | null;
   description: string;
}

interface RoomByCountDesktop {
   id: number;
   room_name: string;
   capacity: number;
   desktop_count: number;
}
