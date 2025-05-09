
import React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const StringFindNode: NodeDefinition = {
  id: 'stringFind',
  label: 'String Find',
  description: 'Finds the start/end position of a substring (like string.find).',
  category: 'String',
  leftSection: <IconSearch size={40} color="#ae3ec9" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForHaystack: false,
  haystackVariable: '',
  haystackString: '',
  useVariableForNeedle: false,
  needleVariable: '',
  needleString: '',
  startIndexType: 'literal',
  startIndex: '1', 
  plainFind: false, 
  resultStartIndexVar: '', 
  resultEndIndexVar: '', 
  
};
