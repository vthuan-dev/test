/* eslint-disable @typescript-eslint/naming-convention */
import { Box, type SxProps, type Theme, styled } from '@mui/material';
import React from 'react';

interface ControllerLabelProps {
   title?: string;
   required?: boolean;
   sx?: SxProps<Theme> | undefined;
   children?: React.ReactNode;
}

function ControllerLabel(props: ControllerLabelProps) {
   const { title, required, sx, children } = props;

   return (
      <TypographyExtend sx={sx}>
         {title} {children}
         {required && (
            <Box component="span" sx={({ palette }) => ({ color: palette.error.main, fontSize: 16, lineHeight: 1.4 })}>
               *
            </Box>
         )}
      </TypographyExtend>
   );
}

const TypographyExtend = styled('span')(({ theme }) => ({
   color: theme.base.text.gray2,
   display: 'flex',
   alignItems: 'center',
   fontSize: 15,
   padding: '5px 0',
   fontWeight: 500,
   gap: 0.5,
   pt: 0,
   pb: 0.5,
   pl: 0.5,
}));

export { ControllerLabel };
