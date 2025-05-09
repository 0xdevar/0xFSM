
import React from 'react';
import { IconJson } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';

export const JsonNode: NodeDefinition = {
  id: 'json',
  label: 'JSON Encode/Decode',
  description: 'Encodes a table to JSON string or decodes a JSON string to table.',
  category: 'Data', 
  leftSection: <IconJson size={40} />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  jsonOperation: 'encode', 
  inputVariable: 'inputData',
  resultVariable: 'jsonData',

  execute: function(context: ExecutionContext) {
    const operation = this.jsonOperation || 'encode';
    const inputVar = this.inputVariable;
    const resultVar = this.resultVariable;

    if (!isValidLuaIdentifier(inputVar)) {
       return { action: 'json', status: 'error', operation, message: `Invalid input variable name: ${inputVar}` };
    }
    if (!isValidLuaIdentifier(resultVar)) {
       return { action: 'json', status: 'error', operation, message: `Invalid result variable name: ${resultVar}` };
    }

    const inputValue = context.getVariable(inputVar || '');
    let resultValue: any = null; 
    let status = 'success';
    let message = '';

    try {
        if (operation === 'encode') {
            
             if (inputValue === undefined) {
                 throw new Error(`Input variable "${inputVar}" is undefined.`);
             }
            resultValue = JSON.stringify(inputValue);
            console.log(`JsonNode (Encode): Encoding variable "${inputVar}". Result length: ${resultValue?.length}`);

        } else { 
             
             if (typeof inputValue !== 'string') {
                 throw new Error(`Input variable "${inputVar}" must be a string for decoding.`);
             }
             if (inputValue === '') { 
                 resultValue = null;
                  console.log(`JsonNode (Decode): Input variable "${inputVar}" is empty string, result is nil.`);
             } else {
                 resultValue = JSON.parse(inputValue);
                  console.log(`JsonNode (Decode): Decoding variable "${inputVar}". Result type: ${typeof resultValue}`);
             }
        }
    } catch (e: any) {
        console.error(`JsonNode (${operation}): Error processing variable "${inputVar}": `, e);
        status = 'error';
        message = `JSON ${operation} failed: ${e.message}`;
        resultValue = null; 
    }

    context.setVariable(resultVar!, resultValue);

    return {
      action: 'json',
      status: status,
      message: message,
      operation: operation,
      inputVariable: inputVar,
      resultVariable: resultVar,
      
    };
  }
};