
import React from 'react';
import { IconSortAscendingLetters } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';

export const TableSortNode: NodeDefinition = {
  id: 'tableSort',
  label: 'Table Sort',
  description: 'Sorts a table in-place, optionally with a custom function.',
  category: 'Data',
  leftSection: <IconSortAscendingLetters size={40} color="#a5d8ff" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  tableVariable: 'myTable',
  sortFunctionType: 'none', 
  sortFunctionVariable: '', 
  
};
