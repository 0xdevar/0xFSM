

import React from 'react';
import { IconLetterCase } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const ToStringNode: NodeDefinition = {
  id: 'toString',
  label: 'To String',
  description: 'Converts a value to its string representation (like tostring()).',
  category: 'Utility',
  leftSection: <IconLetterCase size={40} color="#4dabf7" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: true,
  inputVariable: '',
  inputValue: '', 
  resultVariable: 'stringValue',

  execute: function(context: ExecutionContext) {
    const useVar = this.useVariableForInput;
    const inputVar = this.inputVariable;
    const inputLiteral = this.inputValue;
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'toString', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    let valueToConvert: any;
    if (useVar) {
        if (!isValidLuaIdentifier(inputVar)) { return { action: 'toString', status: 'error', message: `Invalid input variable name: ${inputVar}` }; }
         
        valueToConvert = context.getVariable(inputVar || '', null);
    } else {
        valueToConvert = parseLiteral(inputLiteral);
    }

    
    let stringResult: string;
    try {
        if (valueToConvert === null || valueToConvert === undefined) {
             stringResult = 'nil';
        } else if (typeof valueToConvert === 'object') {
             
             
             
             stringResult = JSON.stringify(valueToConvert); 
        } else {
            stringResult = String(valueToConvert); 
        }
        console.log(`ToStringNode: Converted value to string: "${stringResult}"`);
    } catch (e: any) {
         console.error("ToStringNode: Error during conversion simulation:", e);
         stringResult = `[CONVERSION ERROR: ${e.message}]`;
    }

    context.setVariable(resultVarName!, stringResult);

    return {
      action: 'toString',
      status: 'simulated',
      originalValue: valueToConvert,
      stringValue: stringResult,
      resultVariable: resultVarName,
    };
  }
};
