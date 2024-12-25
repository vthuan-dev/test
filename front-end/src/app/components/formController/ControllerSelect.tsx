/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, FormHelperText, MenuItem, OutlinedInput, Select } from '@mui/material';
import { type Control, Controller, type FieldValues, type Path, type PathValue } from 'react-hook-form';

interface ControllerSelectProps<TFieldValues extends FieldValues = FieldValues, TOption = { [key: string]: any }> {
   options: TOption[]; // Array of options of type TOption
   name: Path<TFieldValues>; // Name of the field (from react-hook-form's Path)
   valuePath?: keyof TOption; // Path for the value in the options object
   titlePath?: keyof TOption; // Path for the title in the options object
   defaultValue?: PathValue<TFieldValues, Path<TFieldValues>>; // Optional default value
   control: Control<TFieldValues>; // React Hook Form control
   placeholder?: string; // Optional placeholder for the select
   disabledMenuItem?: (option: TOption) => boolean; // Function to disable menu items based on the option
}

function ControllerSelect<TFieldValues extends FieldValues, TOption>({
   options,
   name,
   defaultValue,
   valuePath = 'id' as keyof TOption,
   titlePath = 'name' as keyof TOption,
   control,
   placeholder = '',
   disabledMenuItem,
   ...rest
}: ControllerSelectProps<TFieldValues, TOption>): React.ReactElement {
   return (
      <Controller
         render={({ field, fieldState: { error } }) => (
            <>
               <Select
                  displayEmpty
                  fullWidth
                  variant="outlined"
                  id={name as string}
                  error={Boolean(error)}
                  size="small"
                  {...field}
                  {...rest}
                  renderValue={(selected) => {
                     if (!selected) {
                        return (
                           <Box component="span" sx={{ color: '#BCBCBC' }}>
                              {placeholder}
                           </Box>
                        );
                     }
                     // Ensure the returned value is a ReactNode
                     const selectedOption = options.find((item) => String(item[valuePath]) === String(selected));
                     return selectedOption ? String(selectedOption[titlePath]) : '';
                  }}
                  input={<OutlinedInput />}
               >
                  {options.map((option, index) => (
                     <MenuItem
                        key={index}
                        value={option[valuePath] as unknown as string}
                        disabled={disabledMenuItem?.(option)}
                     >
                        {String(option[titlePath])}
                     </MenuItem>
                  ))}
               </Select>
               {error && (
                  <FormHelperText variant="standard" sx={({ palette }) => ({ color: palette.error.main, ml: 1 })}>
                     {error.message}
                  </FormHelperText>
               )}
            </>
         )}
         defaultValue={defaultValue ?? ('' as PathValue<TFieldValues, Path<TFieldValues>>)}
         name={name}
         control={control}
      />
   );
}

export { ControllerSelect };
