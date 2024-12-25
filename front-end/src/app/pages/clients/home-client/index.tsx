/* eslint-disable @typescript-eslint/naming-convention */
import './home.css';
import { Box, Button, Grid, Typography, Card, CardContent, CardMedia, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import ProductItem from '../Products/components/ProductItem';

import RoomItem from './component/RoomItem';
import { apiGetListProduct, getRom } from './service';

import { ROUTE_PATH } from '@constants';

const cafeImages = [
   'https://cybercore.vn/wp-content/uploads/2020/09/thiet-ke-quan-game-cyber-gia-re-quan-3.png',
   'https://cybercore.vn/wp-content/uploads/2020/09/thiet-ke-thi-cong-phong-cyber-game-hang-dau-tphcm.jpg',
];

const additionalGamingEquipment = [
   {
      name: 'Màn hình Chơi Game',
      description: 'Màn hình chơi game với độ phân giải 4K cho trải nghiệm tốt nhất.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTawCsTh4Q2GVyPW9hDGoJ3ImEPgb3tMwGrYA&s', // Pexels
   },
   {
      name: 'Khu Vực Game Thoải Mái',
      description: 'Khu vực trò chơi thoải mái với ghế sofa và bàn chơi.',
      image: 'data:image/jpeg;base64,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', // Pexels
   },
   {
      name: 'Trải Nghiệm Game VR',
      description: 'Trải nghiệm game ảo với thiết bị VR mới nhất.',
      image: 'data:image/jpeg;base64,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', // Pexels
   },
   {
      name: 'Dàn Gaming Hiện Đại',
      description: 'Dàn gaming với thiết kế hiện đại và đầy đủ thiết bị.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpLV25s_qkBu2x-MhBb1KwNN8DupruEb8l9w&s', // Pexels
   },
];

export const HomeClient = () => {
   const { data: dataRooms } = getRom();
   const { data: dataProduct } = apiGetListProduct({});

   return (
      <Box>
         {/* Banner Section */}
         <Box mb={4} textAlign="center">
            <Typography variant="h2" fontWeight={700} sx={{ color: '#3f51b5' }}>
               
            </Typography>
            <Box
               component="img"
               src={cafeImages[0]}
               alt="Gaming Café"
               sx={{
                  width: '100%',
                  maxHeight: '400px',
                  borderRadius: '20px',
                  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                  objectFit: 'cover',
                  mt: 2,
               }}
            />
         </Box>

         {/* List of Rooms */}
         <Grid container mt={2} spacing={4}>
            <Grid item xs={12}>
               <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h4" fontSize={24} textTransform="capitalize" sx={{ color: '#3f51b5' }}>
                     Danh sách Phòng
                  </Typography>
                  <Button
                     variant="text"
                     component={Link}
                     to={ROUTE_PATH.ROOM}
                     sx={{
                        textDecoration: 'underline',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#3f51b5',
                     }}
                  >
                     Xem tất cả <KeyboardDoubleArrowRightIcon />
                  </Button>
               </Box>
               <Divider sx={{ mb: 2 }} />
            </Grid>
            {dataRooms &&
               dataRooms.data.length > 0 &&
               dataRooms.data.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                     <RoomItem room={item} />
                  </Grid>
               ))}
         </Grid>

         {/* Equipment Section */}
         <Typography variant="h4" fontWeight={700} mb={3} textAlign="center" mt={5} sx={{ color: '#3f51b5' }}>
            Thiết bị tại quán
         </Typography>
         <Grid container spacing={4} justifyContent="center">
            {additionalGamingEquipment.map((item, index) => (
               <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                     sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: 345,
                        borderRadius: '15px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        transition: '0.3s',
                        height: '100%', // Đảm bảo chiều cao thẻ Card là 100%
                        '&:hover': {
                           transform: 'scale(1.05)',
                           boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)',
                        },
                     }}
                  >
                     <CardMedia
                        component="img"
                        image={item.image}
                        alt={item.name}
                        sx={{
                           borderRadius: '15px 15px 0 0',
                           height: 250, // Đặt chiều cao cho hình ảnh
                           objectFit: 'cover', // Giữ tỷ lệ cho hình ảnh
                        }}
                     />
                     <CardContent
                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                     >
                        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                           {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                           {item.description}
                        </Typography>
                     </CardContent>
                  </Card>
               </Grid>
            ))}
         </Grid>

         {/* List of Products */}
         <Grid container mt={5} spacing={2}>
            <Grid item xs={12}>
               <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h4" fontSize={24} textTransform="capitalize" sx={{ color: '#3f51b5' }}>
                     Danh sách sản phẩm
                  </Typography>
                  <Button
                     variant="text"
                     component={Link}
                     to={ROUTE_PATH.PRODUCTS}
                     sx={{
                        textDecoration: 'underline',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#3f51b5',
                     }}
                  >
                     Xem tất cả <KeyboardDoubleArrowRightIcon />
                  </Button>
               </Box>
               <Divider sx={{ mb: 2 }} />
            </Grid>
            {dataProduct?.data &&
               dataProduct.data.length > 0 &&
               dataProduct.data.map((item) => (
                  <Grid item xs={6} sm={4} md={3} key={item.id}>
                     <ProductItem product={item} />
                  </Grid>
               ))}
         </Grid>
         <Box component="footer" sx={{ backgroundColor: '#3f51b5', color: '#fff', py: 3, mt: 4 }}>
            <Typography variant="h6" align="center" gutterBottom>
               Hệ Thống Phòng Game
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
               Nơi mang đến trải nghiệm chơi game tuyệt vời nhất!
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
               <Box component={Link} to="#" color="inherit" sx={{ textDecoration: 'none' }}>
                  Điều khoản dịch vụ
               </Box>
               {' | '}
               <Box component={Link} to="#" color="inherit" sx={{ textDecoration: 'none' }}>
                  Chính sách bảo mật
               </Box>
               {' | '}
               <Box component={Link} to="#" color="inherit" sx={{ textDecoration: 'none' }}>
                  Liên hệ
               </Box>
            </Typography>
            <Typography variant="body2" align="center" color="gray">
               © {new Date().getFullYear()} Cyber Game. All rights reserved.
            </Typography>
         </Box>
      </Box>
   );
};

export default HomeClient;
