import { Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFieldArray, type Control } from 'react-hook-form';

import type { RoomCreateType } from '../validation';

import { ControllerTextField } from '@components/formController';

interface TableDescription {
   control: Control<RoomCreateType>;
}

const TableDescription = (props: TableDescription) => {
   const { control } = props;

   const { fields, append, remove } = useFieldArray<RoomCreateType>({
      control,
      name: 'description', // Trường name của description trong form
   });

   return (
      <TableContainer component={Paper} sx={{ boxShadow: 'none', maxHeight: 300, overflowY: 'auto' }}>
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
                     <TableCell>
                        <ControllerTextField control={control} name={`description.${index}.label`} />
                     </TableCell>
                     <TableCell>
                        <ControllerTextField control={control} name={`description.${index}.value`} />
                     </TableCell>
                     <TableCell width={150}>
                        <Stack flexDirection="row" gap={1}>
                           {index !== 0 && (
                              <Button
                                 variant="contained"
                                 color="secondary"
                                 onClick={() => remove(index)} // Xóa mục trong mảng
                              >
                                 Xóa
                              </Button>
                           )}
                           <Button variant="contained" onClick={() => append({ label: '', value: '' })}>
                              Thêm
                           </Button>
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
