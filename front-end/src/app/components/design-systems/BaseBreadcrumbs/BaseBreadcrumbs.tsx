/* eslint-disable @typescript-eslint/naming-convention */
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Box, CircularProgress, type SxProps, type Theme, Typography, styled } from '@mui/material';
import { NavLink } from 'react-router-dom';

import PageNullData from '@pages/error/PageNullData';

interface BaseBreadcrumbsPropsType<TData> {
   arialabel: React.ReactNode;
   breadcrumbs?: { title: string; link: string }[];
   children?: React.ReactNode;
   sx?: SxProps<Theme>;
   data?: TData;
   isCheck?: boolean;
   isLoading?: boolean;
}

function BaseBreadcrumbs<TData>({
   arialabel,
   breadcrumbs,
   sx,
   children,
   data,
   isCheck = false,
   isLoading = false,
}: BaseBreadcrumbsPropsType<TData>) {
   if (isLoading) {
      return (
         <Box
            sx={({ base }) => ({
               height: `calc(100vh - ${base.header.height}px - 70px)`,
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
            })}
         >
            <CircularProgress />
         </Box>
      );
   }

   if (isCheck && !data) {
      return <PageNullData />;
   }

   return (
      <WarrperContainer>
         <Breadcrumbs
            aria-label={arialabel}
            sx={{
               mb: 3,
               mt: 9,
               '& .MuiBreadcrumbs-ol': {
                  background: 'linear-gradient(135deg, #1a1f3c 0%, #141728 100%)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '48px',
                  zIndex: 10,
                  position: 'relative'
               },
               '& .MuiBreadcrumbs-li': {
                  display: 'flex',
                  alignItems: 'center',
                  '& p': {
                     fontSize: '0.9rem',
                     fontWeight: 600,
                     color: '#fff',
                     textTransform: 'uppercase',
                     letterSpacing: '0.5px',
                     padding: '4px 0',
                     margin: 0,
                     position: 'relative',
                     transition: 'all 0.3s ease',
                     whiteSpace: 'nowrap',
                     '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        background: 'linear-gradient(90deg, #00ff88 0%, transparent 100%)',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                     },
                     '&:hover': {
                        color: '#00ff88',
                        '&::after': {
                           opacity: 1,
                        }
                     }
                  }
               },
               '& .MuiBreadcrumbs-separator': {
                  color: 'rgba(255,255,255,0.3)',
                  margin: '0 12px',
               }
            }}
         >
            {breadcrumbs &&
               breadcrumbs.map((path, index) => {
                  return (
                     <Box
                        key={index + 'Breadcrumbs'}
                        component={NavLink}
                        to={path.link}
                        sx={{
                           textDecoration: 'none',
                           color: 'rgba(255,255,255,0.7)',
                           transition: 'all 0.3s ease',
                           '&:hover': {
                              color: '#00ff88',
                           }
                        }}
                     >
                        {path.title}
                     </Box>
                  );
               })}

            <Typography color="text.primary">
               {arialabel}
            </Typography>
         </Breadcrumbs>
         <Content 
            sx={{
               ...sx,
               position: 'relative',
               zIndex: 5
            }}
         >
            {children}
         </Content>
      </WarrperContainer>
   );
}

const WarrperContainer = styled('div')({
   width: '100%',
   position: 'relative',
   paddingTop: '16px',
});

const Content = styled('div')(() => ({
   marginTop: 12,
   position: 'relative',
   zIndex: 5
}));

export default BaseBreadcrumbs;
