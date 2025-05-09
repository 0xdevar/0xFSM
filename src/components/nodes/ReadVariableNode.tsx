

import { IconVariableOff } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const ReadVariableNode: NodeDefinition = {
  id: 'readVariable',
  label: 'Read Variable',
  description: 'Read a variable value from the context',
  leftSection: <IconVariableOff size={40} />,
  category: 'Data',
  
  variableName: '',
  defaultValue: '', 
  onAdd: () => {
    console.log('Read Variable node added');
  },
  execute: function(context: ExecutionContext) {
    const variableName = this.variableName || '';
    const defaultValue = this.defaultValue; 

    console.log(`ReadVariableNode: Attempting to read variable "${variableName}" with default:`, defaultValue);
    const value = context.getVariable(variableName, defaultValue);

    
    return {
      action: 'readVariable',
      variableName: variableName,
      valueRead: value,
      wasFound: context.variables.hasOwnProperty(variableName) 
    };
    
    
    
    
  }
};

