
import React from 'react';
import { IconTableOptions } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils'; 

export const SetTableValueNode: NodeDefinition = {
  id: 'setTableValue',
  label: 'Set Table Value',
  description: 'Sets a value at a specific key within a table.',
  category: 'Data',
  leftSection: <IconTableOptions size={40} />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  tableVariable: 'myTable',
  keyType: 'literal', 
  keyValue: 'myKey', 
  valueType: 'literal', 
  valueSource: '', 

  execute: function(context: ExecutionContext) {
    const tableVarName = this.tableVariable;
    const keyType = this.keyType || 'literal';
    const keyValue = this.keyValue;
    const valueType = this.valueType || 'literal';
    const valueSource = this.valueSource;

    if (!isValidLuaIdentifier(tableVarName)) {
       return { action: 'setTableValue', status: 'error', message: `Invalid table variable name: ${tableVarName}` };
    }

    const table = context.getVariable(tableVarName || '');

    if (typeof table !== 'object' || table === null) {
        console.warn(`SetTableValueNode: Variable "${tableVarName}" is not an object/table.`);
        
        return { action: 'setTableValue', status: 'error', message: `Variable "${tableVarName}" is not a table.` };
    }

    let key: string | number;
    try {
        if (keyType === 'variable') {
            if (!isValidLuaIdentifier(keyValue)) { return { action: 'setTableValue', status: 'error', message: `Invalid key variable name: ${keyValue}` }; }
            key = context.getVariable(keyValue || ''); 
             
             if (typeof key !== 'string' && typeof key !== 'number') key = String(key);
        } else if (keyType === 'number_literal') {
            key = Number(keyValue);
            if (isNaN(key)) throw new Error(`Invalid number literal key: "${keyValue}"`);
        } else { 
            key = String(keyValue || ''); 
        }
    } catch (e: any) {
         return { action: 'setTableValue', status: 'error', message: `Error processing key: ${e.message}` };
    }


    let valueToSet: any;
    if (valueType === 'variable') {
        if (!isValidLuaIdentifier(valueSource)) { return { action: 'setTableValue', status: 'error', message: `Invalid value variable name: ${valueSource}` }; }
        valueToSet = context.getVariable(valueSource || ''); 
    } else { 
        valueToSet = parseLiteral(valueSource); 
    }

    try {
        console.log(`SetTableValueNode: Setting ${tableVarName}[${typeof key === 'number' ? key : `"${key}"`}] =`, valueToSet);
        table[key] = valueToSet; 
         
         
         
         

        return {
          action: 'setTableValue',
          status: 'success',
          table: tableVarName,
          keyUsed: key,
          valueSet: valueToSet,
        };
    } catch (e: any) {
         console.error(`SetTableValueNode: Error setting table value: `, e);
         return { action: 'setTableValue', status: 'error', message: `Failed to set value: ${e.message}` };
    }
  }
};