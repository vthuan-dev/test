/* eslint-disable @typescript-eslint/naming-convention */
import en_us from './en-us';
import vi_vn from './vi-vn';

import { LANGUAGE } from '@constants';

export const resources = {
   [LANGUAGE.VI]: {
      translation: vi_vn,
   },
   [LANGUAGE.EN]: {
      translation: en_us,
   },
};
