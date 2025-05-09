

import { IconSubtask } from '@tabler/icons-react';
import { NodeDefinition, ArgumentSource } from '../types/NodeDefinition'; 
import { ExecutionContext } from '../WorkflowExecutor';
import { FUNC_PREFIX } from '../../pages/UI/GraphContext'; 
import { notifications } from '@mantine/notifications'; 


function parseLiteral(literalString: string): any {
    
    const trimmed = literalString.trim();
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (trimmed.toLowerCase() === 'nil' || trimmed.toLowerCase() === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        try { return JSON.parse(trimmed); } catch (e) { return trimmed.slice(1, -1); }
    }
    return literalString;
}


export const CallFunctionNode: NodeDefinition = {
  id: 'callFunction',
  label: 'Call Function',
  description: 'Executes a defined function graph and stores the result',
  leftSection: <IconSubtask size={40} />,
  category: 'Function',
  allowedGraphTypes: ['file', 'function', 'event'],
  
  functionName: '',
  argumentSources: [],
  resultVariable: 'functionResult',

  onAdd: () => {  },

  execute: function(context: ExecutionContext) {
    
    const funcNameToCall = this.functionName;
    const resultVarName = this.resultVariable || 'functionResult';

    console.log(`CallFunctionNode: Attempting call. Function name from node data: "${funcNameToCall}"`);

    if (!funcNameToCall || typeof funcNameToCall !== 'string') {
       console.warn("CallFunctionNode: Invalid or missing function name specified in node data:", funcNameToCall);
       context.setVariable(resultVarName, null);
       notifications.show({title:'Node Error', message:'Call Function Node: No valid function name selected.', color:'red'});
       return { action: 'callFunction', status: 'error', message: 'No valid function name specified' };
    }

    
    const funcGraphKey = `${FUNC_PREFIX}${funcNameToCall}`;
    console.log(`CallFunctionNode: Constructed graph key: "${funcGraphKey}"`);


    
    const argsToSend: any[] = (this.argumentSources || []).map((argSource: ArgumentSource, index: number) => {
        let argValue: any;
        if (argSource.type === 'variable') {
            argValue = context.getVariable(argSource.value);
            
        } else { 
            argValue = parseLiteral(argSource.value);
            
        }
        return argValue;
    });

    
    console.log(`CallFunctionNode: Executing function graph key "${funcGraphKey}" via context.executeSubgraph with ${argsToSend.length} arguments.`);
    let functionResult: any = undefined;
    try {
        
        functionResult = context.executeSubgraph(funcGraphKey, argsToSend);

    } catch (error: any) {
         
         console.error(`CallFunctionNode: Error occurred *within* the execution of function "${funcNameToCall}" (key: ${funcGraphKey}):`, error);
         functionResult = null; 
         
         context.addResult({
             node: this.label,
             status: 'error',
             message: `Error in called function '${funcNameToCall}': ${error.message || 'Unknown error'}`,
             details: error.stack 
         });
         
    }

    console.log(`CallFunctionNode: Function "${funcNameToCall}" (key: ${funcGraphKey}) returned:`, functionResult);

    
    context.setVariable(resultVarName, functionResult);
    console.log(`CallFunctionNode: Stored result in variable "${resultVarName}"`);

    
    return {
      action: 'callFunction',
      status: 'success', 
      functionCalled: funcNameToCall,
      graphKey: funcGraphKey,
      argumentsSent: argsToSend,
      resultVariable: resultVarName,
      result: functionResult 
    };
  }
};

