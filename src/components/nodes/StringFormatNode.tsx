

import React from 'react';
import { IconQuote } from '@tabler/icons-react';
import { NodeDefinition, ArgumentSource } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const StringFormatNode: NodeDefinition = {
  id: 'stringFormat',
  label: 'String Format',
  description: 'Formats a string using placeholders (like string.format).',
  category: 'String',
  leftSection: <IconQuote size={40} color="#ae3ec9" />, 
  allowedGraphTypes: ['file', 'function', 'event'],
  
  formatString: 'Value: %s, Number: %d',
  argumentSources: [],
  resultVariable: 'formattedString',

  execute: function(context: ExecutionContext) {
    const fmtString = this.formatString || '';
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'stringFormat', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    const args = (this.argumentSources || []).map((argSource: ArgumentSource) => {
        return argSource.type === 'variable'
            ? context.getVariable(argSource.value)
            : parseLiteral(argSource.value);
    });

    
    
    
    
    let simulatedResult = fmtString;
    let argIndex = 0;
    try {
        
        simulatedResult = fmtString.replace(/%[sdif]/g, () => {
             const arg = args[argIndex++];
             
             if (arg === null || arg === undefined) return 'nil';
             return String(arg);
        });
        if (argIndex < args.length) {
            console.warn("StringFormatNode (Simulate): More arguments provided than format specifiers found.");
        }
        console.log(`StringFormatNode (Simulate): Format="${fmtString}", Args=${JSON.stringify(args)}, Result="${simulatedResult}"`);
    } catch (e: any) {
        console.error("StringFormatNode (Simulate): Error during basic format simulation:", e);
        simulatedResult = `[SIMULATION ERROR: ${e.message}]`;
    }

    context.setVariable(resultVarName!, simulatedResult); 

    return {
      action: 'stringFormat',
      status: 'simulated',
      formatString: fmtString,
      arguments: args,
      simulatedResult: simulatedResult,
      resultVariable: resultVarName,
      log: `Simulated string.format. Result stored in ${resultVarName}. Note: Simulation may differ from Lua.`
    };
  }
};
