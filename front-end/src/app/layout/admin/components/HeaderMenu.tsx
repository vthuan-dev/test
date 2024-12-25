import { NavLink } from 'react-router-dom';

import { ROUTE_PATH } from '@constants';



const HeaderMenu = () => {
   return (
      <div className="header-menu header-menu-left">
         <div className="header-menu-des">
            <nav className="header-nav">
               <ul className="item_big">
                  <li className="nav-item">
                     <NavLink
                        className={({ isActive }) => (isActive ? 'a-img a-index active' : 'a-img a-index')}
                        to={ROUTE_PATH.ADMIN_HOME}
                        title="Trang chủ"
                        end
                     >
                        Thống kê
                     </NavLink>
                  </li>
                  <li className="nav-item">
                     <NavLink
                        className={({ isActive }) => (isActive ? 'a-img a-index active' : 'a-img a-index')}
                        to={ROUTE_PATH.ADMIN_PRODUCTS}
                        title="Sản phẩm"
                        end
                     >
                        Sản phẩm
                     </NavLink>
                  </li>
                  <li className="nav-item">
                     <NavLink
                        className={({ isActive }) => (isActive ? 'a-img a-index active' : 'a-img a-index')}
                        to={ROUTE_PATH.ADMIN_DESKTOP}
                        title="Sản phẩm"
                        end
                     >
                        Thiêt bị
                     </NavLink>
                  </li>
                  <li className="nav-item">
                     <NavLink
                        className={({ isActive }) => (isActive ? 'a-img a-index active' : 'a-img a-index')}
                        to={ROUTE_PATH.ADMIN_ROM}
                        title="Sản phẩm"
                        end
                     >
                        Phòng
                     </NavLink>
                  </li>
                  <li className="nav-item">
                     <NavLink
                        className={({ isActive }) => (isActive ? 'a-img a-index active' : 'a-img a-index')}
                        to={ROUTE_PATH.ADMIN_ORDER}
                        title="hóa đơn"
                        end
                     >
                        Hóa đơn
                     </NavLink>
                  </li>
                  <li className="nav-item">
                     <NavLink
                        className={({ isActive }) => (isActive ? 'a-img a-index active' : 'a-img a-index')}
                        to={ROUTE_PATH.ADMIN_USER}
                        title="hóa đơn"
                        end
                     >
                        Khách hàng
                     </NavLink>
                  </li>
               </ul>
            </nav>
         </div>
      </div>
   );
};

export default HeaderMenu;
