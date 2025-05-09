

import { IconArrowBackUp } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const ReturnNode: NodeDefinition = {
  id: 'return',
  label: 'Return Value',
  description: 'Specifies the value this node should return (usable in all graph types)',
  leftSection: <IconArrowBackUp size={40} />,
  category: 'Control Flow', 
  allowedGraphTypes: ['file', 'function', 'event'], 
  
  useVariableForResult: true, 
  returnValue: null,         
  returnVariable: '',        

  onAdd: () => {
    console.log('Return node added');
    
  },

  
  
  execute: function(context: ExecutionContext) {
    let valueToReturn: any;

    if (this.useVariableForResult && this.returnVariable) {
      valueToReturn = context.getVariable(this.returnVariable); 
      console.log(`ReturnNode: Preparing to return value from variable "${this.returnVariable}"`);
      if (valueToReturn === undefined) {
           console.warn(`ReturnNode: Variable "${this.returnVariable}" not found. Returning nil/undefined.`);
           
      }
    } else {
      valueToReturn = this.returnValue; 
      console.log(`ReturnNode: Preparing to return literal value:`, valueToReturn);
    }

    
    
    
    context.setReturnValue(valueToReturn); 

    
    return {
      action: 'return',
      source: this.useVariableForResult ? `variable(${this.returnVariable})` : 'literal',
      valueReturned: valueToReturn 
    };
    
    
    
  }
};

