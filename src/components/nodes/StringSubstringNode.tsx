
import React from 'react';
import { IconScissors } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const StringSubstringNode: NodeDefinition = {
  id: 'stringSubstring',
  label: 'String Substring',
  description: 'Extracts a portion of a string (like string.sub).',
  category: 'String',
  leftSection: <IconScissors size={40} color="#ae3ec9" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: false,
  inputStringVariable: '',
  inputString: '',
  startIndexType: 'literal',
  startIndex: '1', 
  endIndexType: 'literal', 
  endIndex: '', 
  resultVariable: 'substringResult',
  
};
