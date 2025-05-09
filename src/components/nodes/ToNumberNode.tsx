

import React from 'react';
import { IconNumber } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const ToNumberNode: NodeDefinition = {
  id: 'toNumber',
  label: 'To Number',
  description: 'Converts a value to a number, optionally specifying base (like tonumber()).',
  category: 'Utility',
  leftSection: <IconNumber size={40} color="#4dabf7" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForInput: true,
  inputVariable: '',
  inputValue: '', 
  base: '', 
  resultVariable: 'numberValue',

  execute: function(context: ExecutionContext) {
    const useVar = this.useVariableForInput;
    const inputVar = this.inputVariable;
    const inputLiteral = this.inputValue;
    const baseStr = this.base;
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'toNumber', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    let valueToConvert: any;
    if (useVar) {
        if (!isValidLuaIdentifier(inputVar)) { return { action: 'toNumber', status: 'error', message: `Invalid input variable name: ${inputVar}` }; }
        
        valueToConvert = context.getVariable(inputVar || '', null);
    } else {
        valueToConvert = parseLiteral(inputLiteral);
    }

    let baseNum: number | undefined = undefined;
    if (baseStr && baseStr.trim() !== '') {
        const parsedBase = parseInt(baseStr.trim(), 10);
        
        if (!isNaN(parsedBase) && parsedBase >= 2 && parsedBase <= 36) {
            baseNum = parsedBase;
        } else {
            console.warn(`ToNumberNode: Invalid base value "${baseStr}". Ignoring base.`);
        }
    }

    
    let numberResult: number | null = null; 
    let status = 'simulated';
    let message = '';

    try {
        if (typeof valueToConvert === 'number' && baseNum === undefined) {
             numberResult = valueToConvert; 
        } else if (typeof valueToConvert === 'string') {
            const strToConvert = valueToConvert.trim();
            if (baseNum !== undefined) {
                
                const parsedInt = parseInt(strToConvert, baseNum);
                if (!isNaN(parsedInt)) {
                    numberResult = parsedInt;
                    
                    if (numberResult.toString(baseNum).toLowerCase() !== strToConvert.toLowerCase()) {
                         
                         console.warn(`ToNumberNode (Simulate): String "${strToConvert}" partially parsed with base ${baseNum}. Lua might return nil.`);
                         status = 'warning_simulation';
                         message = `Simulation parsed partially; Lua might return nil.`;
                        
                        
                        
                    }
                } 
            } else {
                
                
                 const num = parseFloat(strToConvert);
                 if (!isNaN(num) && isFinite(num)) {
                     
                     
                     if (/^[\s]*[-+]?(0x[0-9a-f]+|(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?)[\s]*$/i.test(strToConvert)) {
                          numberResult = num;
                     } else {
                         console.warn(`ToNumberNode (Simulate): String "${strToConvert}" parsed by parseFloat, but format might not be valid for Lua's tonumber.`);
                         status = 'warning_simulation';
                         message = `Simulated conversion might differ from Lua's stricter rules.`;
                         numberResult = num; 
                     }
                 } 
            }
        } 

        console.log(`ToNumberNode: Converted value (Base: ${baseNum ?? 'auto/10'}) to number:`, numberResult);

    } catch (e: any) {
        console.error("ToNumberNode: Error during conversion simulation:", e);
        numberResult = null; 
        status = 'error';
        message = `Simulation error: ${e.message}`;
    }

    context.setVariable(resultVarName!, numberResult);

    return {
      action: 'toNumber',
      status: status,
      message: message,
      originalValue: valueToConvert,
      baseUsed: baseNum,
      numberResult: numberResult, 
      resultVariable: resultVarName,
    };
  }
};
