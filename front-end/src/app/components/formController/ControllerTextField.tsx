/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { FormHelperText, type SxProps, TextField, type TextFieldVariants, type Theme } from '@mui/material';

import { regexs } from '~/app/configs';

interface ControllerTextFieldProps<TFieldValues extends FieldValues = FieldValues> {
   name: string;
   placeholder?: string;
   defaultValue?: string;
   disabled?: boolean;
   number?: boolean;
   string?: boolean;
   variant?: TextFieldVariants;
   sx?: SxProps<Theme> | undefined;
   maxLength?: number;
   onChangeValue?: (e: any) => void;
   control: Control<TFieldValues>;
   label?: string;
   type?: string;
   size?: any;
}

function ControllerTextField<TFieldValues extends FieldValues = FieldValues>(
   props: ControllerTextFieldProps<TFieldValues>,
): React.ReactNode {
   const {
      name,
      placeholder,
      defaultValue = '',
      sx,
      control,
      number = false,
      string = false,
      disabled = false,
      variant = 'outlined',
      maxLength,
      onChangeValue,
      size = 'small',
      ...rest
   } = props;

   return (
      <Controller
         render={({ field, fieldState: { error } }) => {
            return (
               <React.Fragment>
                  <TextField
                     autoComplete="off"
                     fullWidth
                     id={name}
                     variant={variant}
                     error={Boolean(error)}
                     sx={{ mb: 0.5, ...sx }}
                     placeholder={placeholder}
                     {...field}
                     {...rest}
                     size={size}
                     disabled={disabled}
                     onChange={(e) => {
                        field.onChange(e);

                        return onChangeValue && onChangeValue(e);
                     }}
                     onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                        let newValue = event.target.value;

                        // Kiểm tra maxLength
                        if (maxLength && newValue.length > maxLength) {
                           newValue = newValue.substring(0, maxLength); // Cắt chuỗi nếu vượt quá maxLength
                        }

                        // Kiểm tra number và string
                        if (number) {
                           newValue = String(Number(newValue.replace(regexs.integer, ''))); // Chỉ giữ lại các ký tự số
                        }

                        if (string) {
                           newValue = newValue.replace(regexs.string, ''); // Chỉ giữ lại các ký tự chữ
                        }

                        // Cập nhật giá trị trong input
                        event.target.value = newValue;
                     }}
                  />
                  {error && (
                     <FormHelperText variant="standard" sx={({ palette }) => ({ color: palette.error.main, ml: 1 })}>
                        {error.message}
                     </FormHelperText>
                  )}
               </React.Fragment>
            );
         }}
         defaultValue={defaultValue as never}
         name={name as Path<TFieldValues>}
         control={control}
      />
   );
}

export { ControllerTextField };
