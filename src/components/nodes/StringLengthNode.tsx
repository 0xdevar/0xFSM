
import React from 'react';
import { IconRuler2 } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const StringLengthNode: NodeDefinition = {
  id: 'stringLength',
  label: 'String Length',
  description: 'Gets the length of a string (like #string).',
  category: 'String',
  leftSection: <IconRuler2 size={40} color="#ae3ec9" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: false,
  inputStringVariable: '',
  inputString: '',
  resultVariable: 'stringLengthResult',
  
};
