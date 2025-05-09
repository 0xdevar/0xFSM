
import React from 'react';
import { IconCalculator } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';

export const MathAdvancedNode: NodeDefinition = {
  id: 'mathAdvanced',
  label: 'Advanced Math',
  description: 'Performs advanced math functions (random, floor, pow, etc.).',
  category: 'Utility',
  leftSection: <IconCalculator size={40} />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  mathOperationType: 'floor', 
  
  value1Type: 'literal',
  value1: '0',
  value1Variable: '',
  value2Type: 'literal',
  value2: '0',
  value2Variable: '',
  resultVariable: 'mathAdvResult',
  
};
