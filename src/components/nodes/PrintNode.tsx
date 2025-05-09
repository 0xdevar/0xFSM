

import { IconBrandTablerFilled } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const PrintNode: NodeDefinition = {
  id: 'print',
  label: 'Print',
  description: 'Logs a message to the console',
  leftSection: <IconBrandTablerFilled size={40} />,
  category: 'Utility',
  
  message: 'Hello World',
  color: '#4CAF50',
  printToConsole: true,
  useVariableForMessage: false, 
  messageVariable: '', 
  onAdd: () => {
    console.log('Print node added');
  },
  execute: function(context: ExecutionContext) {
    let messageToPrint: string;

    
    if (this.useVariableForMessage && this.messageVariable) {
      const varValue = context.getVariable(this.messageVariable, `[Variable '${this.messageVariable}' not found]`);
      
      messageToPrint = String(varValue);
      console.log(`PrintNode: Using variable "${this.messageVariable}" for message.`);
    } else {
      messageToPrint = this.message || ''; 
      console.log(`PrintNode: Using literal message.`);
    }

    const finalMessage = messageToPrint; 

    
    if (this.printToConsole) {
      console.log(`%c${finalMessage}`, `color: ${this.color || '#ffffff'}`);
    } else {
        
         console.log(`[Simulate Chat] Color(${this.color}): ${finalMessage}`);
         
    }

    
    return {
        action: 'print',
        messagePrinted: finalMessage,
        source: this.useVariableForMessage ? `variable(${this.messageVariable})` : 'literal'
    };
  }
};

