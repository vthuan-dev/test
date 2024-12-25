import { useTranslation } from 'react-i18next';

import { LazyLoadingImage } from '../lazy-loading-image';

import { images } from '@assets/images';
import { useI18n, useLocalStorage } from '@hooks';
import { LANGUAGE, LOCALSTORAGE_LANGUAGE_KEY } from '@constants';

export const LanguageSystem = () => {
   const translate = useI18n();
   const { i18n } = useTranslation();

   const { setLocalStorage } = useLocalStorage();

   const handleChangeLanguage = (language: string) => {
      setLocalStorage(LOCALSTORAGE_LANGUAGE_KEY, language);
      void i18n.changeLanguage(language);
   };

   return (
      <div className="relative h-full flex items-center group">
         <div className="flex gap-x-2 items-center w-[60px]">
            <LazyLoadingImage src={images.vnFlag} alt={`${translate('FLAG')}`} width="30" height="20" />
            <span className="font-medium">{`${translate('FLAG')}`}</span>
         </div>
         <div
            className="header-user hidden group-hover:block  absolute z-10 bg-white rounded-md right-0 top-[92%]"
            style={{ width: 'max-content' }}
         >
            <div className="py-2 w-40 flex flex-col gap-y-1">
               <div
                  className="px-4 py-1 cursor-pointer hover:text-red-500 hover:bg-slate-400 flex justify-between items-center"
                  onClick={() => handleChangeLanguage(LANGUAGE.VI)}
               >
                  <div className="">{`${translate('COUNTRY_VI')}`}</div>
                  {i18n.language === LANGUAGE.VI && <></>}
                  {/* <CheckIcon width={16} height={16} /> */}
               </div>
               <div
                  className="px-4 py-1 cursor-pointer hover:text-red-500 hover:bg-slate-400 flex justify-between items-center"
                  onClick={() => handleChangeLanguage(LANGUAGE.EN)}
               >
                  <div className="">{`${translate('COUNTRY_EN')}`}</div>
                  {i18n.language === LANGUAGE.EN && <></>}
                  {/* <CheckIcon width={16} height={16} /> */}
               </div>
            </div>
         </div>
      </div>
   );
};
