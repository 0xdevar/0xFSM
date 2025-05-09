

import { IconVariable } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const VariableNode: NodeDefinition = {
  id: 'variable',
  label: 'Set Variable',
  description: 'Create or update a variable',
  leftSection: <IconVariable size={40} />,
  category: 'Data',
  
  name: 'myVariable',
  value: '',
  varType: 'local', 
  dataType: 'string', 
  onAdd: () => {
    console.log('Variable node added');
  },
  execute: function(context: ExecutionContext) {
    let typedValue: any;
    switch(this.dataType) {
        case 'number':
            typedValue = Number(this.value);
            if (isNaN(typedValue)) {
                console.warn(`VariableNode: Invalid number value "${this.value}" for variable "${this.name}". Setting to 0.`);
                typedValue = 0;
            }
            break;
        case 'boolean':
            
            typedValue = typeof this.value === 'boolean' ? this.value : String(this.value).toLowerCase() === 'true';
            break;
        case 'nil':
             typedValue = null; 
             break;
        case 'variable':
            typedValue = this.value;
            break;
        case 'string':
        default:
            typedValue = String(this.value);
            break;
    }

    console.log(`VariableNode: Setting variable "${this.name}" of type "${this.dataType}" to value:`, typedValue);
    context.setVariable(this.name!, typedValue); 

    
    return {
      action: 'setVariable',
      variableName: this.name,
      value: typedValue,
      dataType: this.dataType
    };
  }
};

