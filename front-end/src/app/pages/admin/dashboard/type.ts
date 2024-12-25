export interface IStatisticProduct {
   id: number;
   // eslint-disable-next-line @typescript-eslint/naming-convention
      product_name: string;
      price: number;
   // eslint-disable-next-line @typescript-eslint/naming-convention
      sold_quantity: string;
   // eslint-disable-next-line @typescript-eslint/naming-convention
      total_price: string;
}

export interface IStatisticRoom {
   id: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
   room_name: string;
   price: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
   sold_quantity: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
   total_price: number;
}

