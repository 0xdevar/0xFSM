
import React from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import { NodeDefinition, ArgumentSource } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const CallNativeNode: NodeDefinition = {
  id: 'callNative',
  label: 'Call Native',
  description: 'Calls a FiveM native function (Simulation Only).',
  category: 'Native',
  leftSection: <IconStarFilled size={40} />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  nativeNameOrHash: '', 
  argumentSources: [],
  resultVariable: '', 

  execute: function(context: ExecutionContext) {
    const nativeIdentifier = this.nativeNameOrHash?.trim();
    const resultVarName = this.resultVariable?.trim();

    if (!nativeIdentifier) {
      return { action: 'callNative', status: 'error', message: 'Native name or hash is required.' };
    }
    if (resultVarName && !isValidLuaIdentifier(resultVarName)) {
       return { action: 'callNative', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    const args = (this.argumentSources || []).map((argSource: ArgumentSource) => {

      if (argSource.type === 'variable') {
          if (typeof argSource.value !== 'string') {
               console.warn(`CallNativeNode: Expected string variable name for argument, but got ${typeof argSource.value}. Using 'undefined'.`);
               return undefined;
          }
          return context.getVariable(argSource.value);
      }
      return parseLiteral(argSource.value);
    });

    
    
    
    const callString = `${nativeIdentifier}(${args.map(a => JSON.stringify(a)).join(', ')})`;
    console.log(`[SIMULATE] CallNative: ${resultVarName ? resultVarName + ' = ' : ''}${callString}`);

    
    
    const simulatedResult = null; 

    if (resultVarName) {
        context.setVariable(resultVarName, simulatedResult);
    }

    return {
      action: 'callNative',
      status: 'simulated',
      native: nativeIdentifier,
      arguments: args,
      resultVariable: resultVarName || undefined,
      simulatedResult: simulatedResult,
      log: `Simulated call: ${callString}${resultVarName ? ` (result stored in ${resultVarName})` : ''}`
    };
  }
};