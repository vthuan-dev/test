const CURRENCY_UNIT = 'đ';

export const priceFormat = (
   number: number | string,
   space: string = ',',
   currencyUnit: string = CURRENCY_UNIT,
): string => {
   if (!number || number === 0) {
      return `0${currencyUnit}`;
   }

   // Nếu number là số nguyên, bỏ phần thập phân
   if (Number(number) % 1 === 0) {
      return Number(number)
         .toString()
         .replace(/\B(?=(\d{3})+(?!\d))/g, space) + ` ${currencyUnit}`;
   }

   // Nếu có phần thập phân, làm tròn và bỏ phần ".00"
   return Number(number)
      .toFixed(2) // Giới hạn 2 chữ số thập phân
      .replace(/\B(?=(\d{3})+(?!\d))/g, space)
      .replace(/\.00$/, '') + ` ${currencyUnit}`;
};
