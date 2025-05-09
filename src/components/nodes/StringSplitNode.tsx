

import React from 'react';
import { IconCut } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const StringSplitNode: NodeDefinition = {
  id: 'stringSplit',
  label: 'String Split',
  description: 'Splits a string by a separator into a table.',
  category: 'String',
  leftSection: <IconCut size={40} color="#ae3ec9" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: false,
  inputStringVariable: '',
  inputString: '',
  separator: ',',
  limit: '', 
  resultVariable: 'splitResult',

  execute: function(context: ExecutionContext) {
    const useVar = this.useVariableForInput;
    const inputVar = this.inputStringVariable;
    const inputLiteral = this.inputString;
    const separator = this.separator || ''; 
    const limitStr = this.limit;
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'stringSplit', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    let inputStr: string;
    if (useVar) {
        if (!isValidLuaIdentifier(inputVar)) { return { action: 'stringSplit', status: 'error', message: `Invalid input variable name: ${inputVar}` }; }
        inputStr = String(context.getVariable(inputVar || '', '')); 
    } else {
        inputStr = String(inputLiteral || '');
    }

    let limitNum: number | undefined = undefined;
    if (limitStr && limitStr.trim() !== '') {
        const parsedLimit = parseInt(limitStr.trim(), 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            limitNum = parsedLimit;
        } else {
             console.warn(`StringSplitNode: Invalid limit value "${limitStr}". Ignoring limit.`);
        }
    }

    
    
    let splitResult: string[] = [];
    try {
        if (separator === '') {
            
            
            
            splitResult = inputStr.split('');
             if (limitNum !== undefined) {
                 splitResult = splitResult.slice(0, limitNum);
             }
             console.log(`StringSplitNode (Simulate): Splitting "${inputStr}" by empty separator into characters.`);
        } else {
            splitResult = inputStr.split(separator, limitNum);
            console.log(`StringSplitNode (Simulate): Splitting "${inputStr}" by "${separator}" (Limit: ${limitNum ?? 'none'}). Result count: ${splitResult.length}`);
        }
    } catch (e: any) {
         console.error("StringSplitNode (Simulate): Error during split simulation:", e);
         splitResult = []; 
    }

    context.setVariable(resultVarName!, splitResult); 

    return {
      action: 'stringSplit',
      status: 'simulated',
      inputString: inputStr,
      separator: separator,
      limit: limitNum,
      simulatedResult: splitResult,
      resultVariable: resultVarName,
    };
  }
};
