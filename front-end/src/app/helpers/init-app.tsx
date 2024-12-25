import { useEffect } from 'react';

import stillGamingNoBack from '../assets/images/still-gaming-no-back.png';
import useAuth from '../redux/slices/auth.slice';

import { LazyLoadingFullScreen } from '@components';

const headLinkIcon = document.querySelector('head link[rel="icon"]');

export const InitApp = (props: { children: React.ReactNode }) => {
   const { authGetUser, isInitialized } = useAuth();

   useEffect(() => {
      authGetUser();

      if (headLinkIcon) {
         headLinkIcon.setAttribute('href', stillGamingNoBack);
      } else {
         const headLink = document.querySelector('head');
         const linkLogoImage = document.createElement('link');
         linkLogoImage.setAttribute('type', 'image/svg+xml');
         linkLogoImage.setAttribute('rel', 'icon');
         linkLogoImage.setAttribute('href', stillGamingNoBack);
         headLink?.appendChild(linkLogoImage);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (!isInitialized) return <LazyLoadingFullScreen />;

   return props.children;
};
