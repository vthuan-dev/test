import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { SETTINGS_CONFIG } from '~/app/configs/settings';
import type { RootState } from '../rootReducer';
import { postRequest } from '~/app/configs';
import { API_ROUTE } from '@constants';

const actionGetUser = createAsyncThunk(API_ROUTE.VERIFY_TOKEN, async () => {
   try {
      if (localStorage.getItem(SETTINGS_CONFIG.ACCESS_TOKEN_KEY)) {
         const data = await postRequest(API_ROUTE.VERIFY_TOKEN, {});
         return data;
      }

      throw new Error();
   } catch (error: any) {
      throw new Error(error);
   }
});

const initialState: InitialState = {
   user: null,
   isAuhthentication: false,
   isInitialized: false,
   loading: false,
   redirectOrder: false,
};

export const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      actionLoginReducer: (state, action) => {
         state.user = action.payload;
         state.isInitialized = true;
         state.isAuhthentication = true;
      },

      actionLogoutReducer: (state) => {
         state.user = null;
         state.isInitialized = true;
         state.isAuhthentication = false;
      },
      actionSetRedirectOrder: (state, action) => {
         state.redirectOrder = action.payload;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(actionGetUser.fulfilled, (state, action) => {
            state.user = action.payload as any;
            state.isInitialized = true;
            state.isAuhthentication = true;
         })
         .addCase(actionGetUser.rejected, (state, _) => {
            state.user = null;
            state.isInitialized = true;
            state.isAuhthentication = false;
         });
   },
});

const { actionLoginReducer, actionLogoutReducer, actionSetRedirectOrder } = authSlice.actions;

const useAuth = () => {
   const dispatch: any = useDispatch();

   const auth = useSelector((state: RootState) => state.auth);
   console.log(auth);

   // const authRefreshToken = () => {
   //    return dispatch(actionRefreshToken());
   // };

   const authLogin = (data: DataUser) => {
      dispatch(actionLoginReducer(data));
   };

   const authGetUser = () => {
      dispatch(actionGetUser());
   };

   const authLogout = () => {
      localStorage.removeItem(SETTINGS_CONFIG.ACCESS_TOKEN_KEY);
      dispatch(actionLogoutReducer());
   };

   const setRedirectOrder = (isRedirect: boolean) => {
      actionSetRedirectOrder(isRedirect);
   };

   return { ...auth, authLogin, authGetUser, authLogout, setRedirectOrder };
};

export default useAuth;
