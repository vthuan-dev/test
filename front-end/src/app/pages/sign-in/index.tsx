/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';
import { Button, Box } from '@mui/material';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';

import stillPamingNoBack from '../../assets/images/still-gaming-no-back.png';

import { SignInSchema, type SignInPropType } from './validation';
import { apiPostLogin } from './service';

import { ControllerTextField, ControllerTextFieldPassword } from '@components/formController';
import useAuth from '~/app/redux/slices/auth.slice';
import { ROUTE_PATH } from '@constants';

const SignIn = () => {
   const { authLogin } = useAuth();

   const { handleSubmit, control } = useForm<SignInPropType>({
      resolver: yupResolver(SignInSchema),
      defaultValues: SignInSchema.getDefault(),
   });

   const { mutate } = apiPostLogin(authLogin);

   const handleSubmitForm: SubmitHandler<SignInPropType> = (data) => {
      mutate(data);
   };

   return (
      <SignUpContainer>
         <FormContainer onSubmit={handleSubmit(handleSubmitForm)}>
            <FormBox>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={stillPamingNoBack} alt="InsideBox Logo" style={{ width: '150px', marginBottom: '20px' }} />
               </Box>

               <div className="">
                  <ControllerTextField label="Tài khoản" variant="outlined" name="username" control={control} />
               </div>
               <ControllerTextFieldPassword label="Mật khẩu" name="password" control={control} />

               <Button type="submit" variant="contained" fullWidth>
                  Đăng nhập
               </Button>

               <FooterText>
                  Bạn chưa có tài khoản? <Link to={ROUTE_PATH.REGISTER}>Đăng ký</Link>
               </FooterText>
            </FormBox>
         </FormContainer>

         <ImageContainer />
      </SignUpContainer>
   );
};

const SignUpContainer = styled.div`
   display: flex;
   height: 100vh;
`;

const FormContainer = styled.form`
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   padding: 0 50px;
`;

const ImageContainer = styled.div`
   flex: 1;
   background-image: url('https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRnk263SbtLL9UNz9vNAuwa7C5758UVqtr_zVDqgQ3O_RVwtzau'); // Replace with your image URL
   background-size: cover;
   background-position: center;
`;

const FormBox = styled.div`
   width: 100%;
   max-width: 400px;
   display: flex;
   flex-direction: column;
   gap: 24px;
`;

const FooterText = styled.p`
   margin-top: 20px;
   font-size: 14px;
   text-align: center;

   a {
      color: blue;
      text-decoration: none;
   }
`;

export default SignIn;
