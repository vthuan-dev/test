/* eslint-disable @typescript-eslint/naming-convention */
interface DataUser {
   id: number;
   username: string;
   phone: string;
   email: string;
   user_type: number;
   is_vip: number;
   vip_start_date: Date | null;
   vip_end_date: Date | null;
   created_at: Date;
}
