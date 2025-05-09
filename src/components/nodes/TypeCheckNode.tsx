

import React from 'react';
import { IconQuestionMark } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const TypeCheckNode: NodeDefinition = {
  id: 'typeCheck',
  label: 'Type Check',
  description: 'Gets the Lua type of a value (like type()).',
  category: 'Utility',
  leftSection: <IconQuestionMark size={40} color="#4dabf7" />, 
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: true,
  inputVariable: '',
  inputValue: '', 
  resultVariable: 'valueType',

  execute: function(context: ExecutionContext) {
    const useVar = this.useVariableForInput;
    const inputVar = this.inputVariable;
    const inputLiteral = this.inputValue;
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'typeCheck', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    let valueToCheck: any;
    if (useVar) {
        if (!isValidLuaIdentifier(inputVar)) { return { action: 'typeCheck', status: 'error', message: `Invalid input variable name: ${inputVar}` }; }
        
        if (Object.prototype.hasOwnProperty.call(context.variables, inputVar || '')) {
             valueToCheck = context.getVariable(inputVar || '');
        } else {
             valueToCheck = undefined; 
        }
    } else {
        valueToCheck = parseLiteral(inputLiteral);
    }

    
    let luaType: string;
    const jsType = typeof valueToCheck;

    if (valueToCheck === null) {
        luaType = 'nil'; 
    } else if (valueToCheck === undefined) {
        luaType = 'nil'; 
    } else if (jsType === 'string') {
        luaType = 'string';
    } else if (jsType === 'number') {
        
        luaType = 'number';
    } else if (jsType === 'boolean') {
        luaType = 'boolean';
    } else if (jsType === 'function') {
        
        luaType = 'function';
    } else if (jsType === 'object') {
        
        luaType = 'table';
    } else {
         luaType = jsType; 
    }

    console.log(`TypeCheckNode: Checked value (JS Type: ${jsType}), Simulated Lua Type: "${luaType}"`);
    context.setVariable(resultVarName!, luaType); 

    return {
      action: 'typeCheck',
      status: 'simulated',
      valueChecked: valueToCheck, 
      simulatedLuaType: luaType,
      resultVariable: resultVarName,
    };
  }
};
