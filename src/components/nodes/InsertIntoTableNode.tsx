

import React from 'react';
import { IconListNumbers } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const InsertIntoTableNode: NodeDefinition = {
  id: 'insertIntoTable',
  label: 'Insert Into Table',
  description: 'Inserts a value at the next available numeric index (like table.insert).',
  category: 'Data',
  leftSection: <IconListNumbers size={40} color="#a5d8ff" />, 
  allowedGraphTypes: ['file', 'function', 'event'],
  
  tableVariable: 'myTable',
  valueType: 'literal', 
  valueSource: '', 

  execute: function(context: ExecutionContext) {
    const tableVarName = this.tableVariable;
    const valueType = this.valueType || 'literal';
    const valueSource = this.valueSource;

    if (!isValidLuaIdentifier(tableVarName)) {
       return { action: 'insertIntoTable', status: 'error', message: `Invalid table variable name: ${tableVarName}` };
    }

    const table = context.getVariable(tableVarName || '');

    
    if (!Array.isArray(table)) {
        console.warn(`InsertIntoTableNode: Variable "${tableVarName}" is not an array. Cannot simulate table.insert correctly.`);
        return { action: 'insertIntoTable', status: 'error', message: `Variable "${tableVarName}" is not an array (required for simulation).` };
    }

    let valueToInsert: any;
    if (valueType === 'variable') {
        if (!isValidLuaIdentifier(valueSource)) { return { action: 'insertIntoTable', status: 'error', message: `Invalid value variable name: ${valueSource}` }; }
        valueToInsert = context.getVariable(valueSource || ''); 
    } else { 
        valueToInsert = parseLiteral(valueSource); 
    }

    try {
        console.log(`InsertIntoTableNode: Inserting into "${tableVarName}":`, valueToInsert);
        table.push(valueToInsert); 

        
        
        
        

        return {
          action: 'insertIntoTable',
          status: 'success',
          table: tableVarName,
          valueInserted: valueToInsert,
          newLength: table.length
        };
    } catch (e: any) {
         console.error(`InsertIntoTableNode: Error inserting into table: `, e);
         return { action: 'insertIntoTable', status: 'error', message: `Failed to insert value: ${e.message}` };
    }
  }
};
