import languages from '../i18n';

import { SvgIcon } from '@helpers';
import { useI18n } from '@hooks';

export const User = () => {
   const translate = useI18n(languages);

   const isLogin = false;

   return (
      <div className="relative h-full flex items-center group">
         {isLogin ? (
            <>
               <div className="w-7 h-7">{/* <Avatar src="" className="w-full h-full" /> */}</div>

               <div
                  className="header-user hidden group-hover:block  absolute z-10 bg-white rounded-md right-0 top-[92%]"
                  style={{ width: 'max-content' }}
               >
                  <div className="py-2 w-full flex flex-col gap-y-1">
                     <div className="px-4 py-1 cursor-pointer hover:text-red-500 hover:bg-slate-400">{`${translate('PROFILE')}`}</div>
                     <div className="px-4 py-1 cursor-pointer hover:text-red-500 hover:bg-slate-400">{`${translate('LOG_OUT')}`}</div>
                  </div>
               </div>
            </>
         ) : (
            <>
               <SvgIcon name="user" width="24" height="24" />

               <div
                  className="header-user hidden group-hover:block  absolute z-10 bg-white rounded-md right-0 top-[92%]"
                  style={{ width: 'max-content' }}
               >
                  <div className="py-2 w-full flex flex-col gap-y-1">
                     <div className="px-4 py-1 cursor-pointer hover:text-red-500 hover:bg-slate-400">{`${translate('SIGNIN')}`}</div>
                     <div className="px-4 py-1 cursor-pointer hover:text-red-500 hover:bg-slate-400">{`${translate('REGISTER')}`}</div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
};
