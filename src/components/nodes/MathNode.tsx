

import { IconMath } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const MathNode: NodeDefinition = {
  id: 'math',
  label: 'Math Operation',
  description: 'Performs mathematical operations, optionally using variables',
  leftSection: <IconMath size={40} />,
  category: 'Utility',
  
  operation: 'add',
  value1: 0, 
  useVariableForValue1: false,
  value1Variable: '',
  value2: 0, 
  useVariableForValue2: false,
  value2Variable: '',
  resultVariable: 'mathResult', 
  onAdd: () => {
    console.log('Math node added');
  },
  execute: function(context: ExecutionContext) {
    
    let operand1: number;
    if (this.useVariableForValue1 && this.value1Variable) {
      operand1 = Number(context.getVariable(this.value1Variable, 0)); 
      console.log(`MathNode: Using variable "${this.value1Variable}" for Value 1.`);
    } else {
      operand1 = Number(this.value1); 
       console.log(`MathNode: Using literal for Value 1.`);
    }

    
    let operand2: number;
    if (this.useVariableForValue2 && this.value2Variable) {
      operand2 = Number(context.getVariable(this.value2Variable, 0)); 
      console.log(`MathNode: Using variable "${this.value2Variable}" for Value 2.`);
    } else {
      operand2 = Number(this.value2); 
       console.log(`MathNode: Using literal for Value 2.`);
    }

    
    if (isNaN(operand1)) {
        console.warn(`MathNode: Operand 1 ("${this.useVariableForValue1 ? this.value1Variable : this.value1}") is NaN. Using 0.`);
        operand1 = 0;
    }
    if (isNaN(operand2)) {
        console.warn(`MathNode: Operand 2 ("${this.useVariableForValue2 ? this.value2Variable : this.value2}") is NaN. Using 0.`);
        operand2 = 0;
    }

    
    let result: number;
    switch(this.operation) {
      case 'add':
        result = operand1 + operand2;
        break;
      case 'subtract':
        result = operand1 - operand2;
        break;
      case 'multiply':
        result = operand1 * operand2;
        break;
      case 'divide':
        
        result = operand2 !== 0 ? operand1 / operand2 : 0;
        if (operand2 === 0) console.warn("MathNode: Division by zero detected. Result set to 0.");
        break;
      default:
         console.warn(`MathNode: Unknown operation "${this.operation}". Defaulting to 0.`);
        result = 0;
    }

    
    const resultVarName = this.resultVariable || 'mathResult'; 
    console.log(`MathNode: Storing result ${result} in variable "${resultVarName}"`);
    context.setVariable(resultVarName, result);

    return {
      action: 'math',
      operation: this.operation,
      operand1,
      operand2,
      result,
      resultVariable: resultVarName
    };
  }
};

