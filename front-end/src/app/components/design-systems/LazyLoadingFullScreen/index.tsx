import NProgress from 'nprogress';
import { useEffect } from 'react';

import './style.css';

function LazyLoadingFullScreen() {
   NProgress.configure({ showSpinner: false });

   useEffect(() => {
      NProgress.start();
      return () => {
         NProgress.done();
      };
   }, []);

   return (
      <div className="container">
         <div className="dot"></div>
         <div className="dot"></div>
         <div className="dot"></div>
         <div className="dot"></div>
         <div className="dot"></div>
      </div>
   );
}

export { LazyLoadingFullScreen };
