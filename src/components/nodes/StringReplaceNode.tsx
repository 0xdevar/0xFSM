
import React from 'react';
import { IconReplace } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const StringReplaceNode: NodeDefinition = {
  id: 'stringReplace',
  label: 'String Replace',
  description: 'Replaces occurrences of a pattern in a string (like string.gsub).',
  category: 'String',
  leftSection: <IconReplace size={40} color="#ae3ec9" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: false,
  inputStringVariable: '',
  inputString: '',
  useVariableForPattern: false,
  patternVariable: '',
  patternString: '',
  useVariableForReplacement: false,
  replacementVariable: '',
  replacementString: '',
  limitType: 'literal',
  limit: '', 
  resultStringVariable: 'replacedString',
  resultCountVariable: '', 
  
};
