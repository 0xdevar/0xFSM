
import React from 'react';
import { IconTableMinus } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const TableRemoveNode: NodeDefinition = {
  id: 'tableRemove',
  label: 'Table Remove',
  description: 'Removes an element from a table by index (like table.remove).',
  category: 'Data',
  leftSection: <IconTableMinus size={40} color="#a5d8ff" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  tableVariable: 'myTable',
  indexType: 'literal', 
  index: '', 
  resultRemovedValueVar: '', 
  
};
