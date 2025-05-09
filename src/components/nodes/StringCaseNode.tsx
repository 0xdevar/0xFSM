
import React from 'react';
import { IconLetterCase } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';

export const StringCaseNode: NodeDefinition = {
  id: 'stringCase',
  label: 'String Case Change',
  description: 'Converts a string to lowercase or uppercase.',
  category: 'String',
  leftSection: <IconLetterCase size={40} color="#ae3ec9" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: false,
  inputStringVariable: '',
  inputString: '',
  caseType: 'lower', 
  resultVariable: 'casedString',
  
};
