import { Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFieldArray, type Control } from 'react-hook-form';

import type { CreateDesktopType } from '../validation';

import { ControllerTextField } from '@components/formController';

interface TableDescription {
   control: Control<CreateDesktopType>;
}

const TableDescription = (props: TableDescription) => {
   const { control } = props;

   const { fields, append, remove } = useFieldArray<CreateDesktopType>({
      control,
      name: 'description', // Trường name của description trong form
   });

   return (
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
         <Table sx={{ border: '1px solid #ccc' }}>
            <TableHead>
               <TableRow>
                  <TableCell sx={{ py: 1 }}>Label</TableCell>
                  <TableCell sx={{ py: 1 }}>Value</TableCell>
                  <TableCell sx={{ py: 1 }}></TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {fields.map((item, index) => (
                  <TableRow key={item.id}>
                     <TableCell sx={{ p: 1 }}>
                        <ControllerTextField control={control} name={`description.${index}.label`} />
                     </TableCell>
                     <TableCell sx={{ p: 1 }}>
                        <ControllerTextField control={control} name={`description.${index}.value`} />
                     </TableCell>
                     <TableCell width={140} sx={{ p: 1 }}>
                        <Stack flexDirection="row" gap={1}>
                           <Button variant="contained" size="small" onClick={() => append({ label: '', value: '' })}>
                              Thêm
                           </Button>
                           {index !== 0 && (
                              <Button
                                 variant="contained"
                                 color="secondary"
                                 size="small"
                                 onClick={() => remove(index)} // Xóa mục trong mảng
                              >
                                 Xóa
                              </Button>
                           )}
                        </Stack>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </TableContainer>
   );
};

export default TableDescription;
