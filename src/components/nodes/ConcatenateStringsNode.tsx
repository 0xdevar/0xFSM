

import { IconLink } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const ConcatenateStringsNode: NodeDefinition = {
  id: 'concatStrings',
  label: 'Concatenate Strings',
  description: 'Joins two strings together, stores in a variable',
  leftSection: <IconLink size={40} />,
  category: 'String',
  
  string1: 'Hello',
  useVariableForString1: false,
  string1Variable: '',
  string2: ' World',
  useVariableForString2: false,
  string2Variable: '',
  resultVariable: 'concatResult', 
  onAdd: () => {
    console.log('Concatenate Strings node added');
  },
  execute: function(context: ExecutionContext) {
    
    let str1: string;
    if (this.useVariableForString1 && this.string1Variable) {
      str1 = String(context.getVariable(this.string1Variable, '')); 
      console.log(`ConcatNode: Using variable "${this.string1Variable}" for String 1.`);
    } else {
      str1 = String(this.string1); 
       console.log(`ConcatNode: Using literal for String 1.`);
    }

    
    let str2: string;
    if (this.useVariableForString2 && this.string2Variable) {
      str2 = String(context.getVariable(this.string2Variable, '')); 
       console.log(`ConcatNode: Using variable "${this.string2Variable}" for String 2.`);
    } else {
      str2 = String(this.string2); 
       console.log(`ConcatNode: Using literal for String 2.`);
    }

    
    const result = str1 + str2; 

    
    const resultVarName = this.resultVariable || 'concatResult';
    console.log(`ConcatNode: Storing result "${result}" in variable "${resultVarName}"`);
    context.setVariable(resultVarName, result);

    return {
      action: 'concatenate',
      string1: str1,
      string2: str2,
      result: result,
      resultVariable: resultVarName
    };
  }
};

