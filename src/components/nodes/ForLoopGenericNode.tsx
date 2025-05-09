
import { IconCodeAsterisk } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const ForLoopGenericNode: NodeDefinition = {
  id: 'forLoopGeneric',
  label: 'For Loop (Generic)',
  description: 'Iterates over table keys/values (pairs or ipairs)',
  leftSection: <IconCodeAsterisk size={40} color="#ff922b" />,
  category: 'Control Flow',
  
  tableVariable: 'myTable',
  iterationType: 'pairs', 
  keyVariable: 'key', 
  valueVariable: 'value',
  allowedGraphTypes: ['file', 'function', 'event'],

  
  execute: function(context: ExecutionContext): { shouldEnterLoop: boolean, loopParams?: any } {
    const tableVarName = this.tableVariable;
    const iterType = this.iterationType || 'pairs';
    const keyVar = this.keyVariable || (iterType === 'ipairs' ? 'index' : 'key'); 
    const valueVar = this.valueVariable || 'value'; 

    if (!tableVarName) {
        const msg = "Table variable name is missing.";
        console.error(`ForLoopGenericNode Error: ${msg}`);
        context.addResult({ node: this.label, status: 'error', message: msg });
        return { shouldEnterLoop: false };
    }

    const table = context.getVariable(tableVarName);

    
    if (table === null || typeof table !== 'object') {
         const msg = `Variable "${tableVarName}" does not contain a valid table/object. Found: ${typeof table}`;
         console.error(`ForLoopGenericNode Error: ${msg}`);
         context.addResult({ node: this.label, status: 'error', message: msg });
         return { shouldEnterLoop: false };
    }

    let iterator: IterableIterator<[any, any]> | null = null;
    let firstKey: any = undefined;
    let firstValue: any = undefined;
    let isEmpty = true;

    try {
        if (iterType === 'ipairs' && Array.isArray(table)) {
             
             
             if (table.length > 0) {
                 isEmpty = false;
                 firstKey = 1; 
                 firstValue = table[0];
                 iterator = table.entries(); 
             }
        } else {
             
            const entries = Object.entries(table);
            if (entries.length > 0) {
                isEmpty = false;
                [firstKey, firstValue] = entries[0];
                iterator = entries.values(); 
            }
        }
    } catch (e: any) {
        const msg = `Error creating iterator for variable "${tableVarName}": ${e.message}`;
        console.error(`ForLoopGenericNode Error: ${msg}`);
        context.addResult({ node: this.label, status: 'error', message: msg });
        return { shouldEnterLoop: false };
    }


    const shouldEnterLoop = !isEmpty;

    if (shouldEnterLoop) {
        
        context.setVariable(keyVar, firstKey);
        context.setVariable(valueVar, firstValue);
        

        
        return {
            shouldEnterLoop: true,
            loopParams: {
                iterType,
                iterator, 
                tableVarName, 
                keyVar,
                valueVar,
                
                ...(iterType === 'ipairs' && Array.isArray(table) && {
                    targetArray: table, 
                    currentIndex: 0 
                })
            }
        };
    } else {
        
        return { shouldEnterLoop: false };
    }
  }
};
