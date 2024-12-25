import en from './en';
import vi from './vi';

import { LANGUAGE } from '@constants';

export default {
   name: 'HEADER',
   locales: [
      {
         key: LANGUAGE.EN,
         value: en,
      },
      {
         key: LANGUAGE.VI,
         value: vi,
      },
   ],
};
